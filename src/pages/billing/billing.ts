import { Component } from '@angular/core';
import { NavController, Platform, NavParams, ViewController, PopoverController, ModalController } from 'ionic-angular';
import { RetailerService } from '../../providers/retailer.service'
import { CommonService } from '../../providers/common.service'
import { LocalstorageProvider } from '../../providers/localstorage/localstorage'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LoadingController } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { AlertController } from 'ionic-angular';
import { PinScreenPage } from '../pin-screen/pin-screen'
import { QrScanPage } from '../qr-scan/qr-scan'
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@Component({
  selector: 'page-billing',
  templateUrl: 'billing.html',
})
export class BillingPage {

  data: any;
  userExists: boolean;
  class: string = 'largedefault';
  includeTax: boolean = false;
  saleForm: FormGroup;
  statsData: any = {};
  isLandscape = false;
  rewardtype = 'Points';
  rewardAmount = 0;
  disctype = 'Amount';
  discAmount = 0;
  currentChange = 'mobile';
  decimalBill = 1;
  decimalDisc = 1;
  decimalRew = 1;
  decimalAmount = 1;
  validOffers = [];
  finalBill = 0.0;
  amountPaid = 0.0;
  userBalance = 0.0; useUserBalance = false; userRewards = 0.0; useUserRewards = false;
  discclass = 'item'; amountclass = 'item'; mobileclass = 'item'; billAmountclass = 'item'; rewclass = 'item';
  deductedBalance = 0; deductedRewards = 0;
  userType = 0;
  veryNewUser = false;
  grazieUser = false;
  pinEntered = false;
  pinverify = false;
  otpverify = false;
  qrverify = false;
  disableBalance = true;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public platform: Platform,
    private retailers: RetailerService,
    private localStorage: LocalstorageProvider,
    public popoverCtrl: PopoverController,
    private fb: FormBuilder,
    private commonService: CommonService,
    private modalCtrl: ModalController,
    private screenOrientation: ScreenOrientation,
    public alertCtrl: AlertController,
    private barcodeScanner: BarcodeScanner, 
    public loadingCtrl: LoadingController) {

    var dateString = (new Date()).toISOString()

    if (this.platform.is('tablet')) {
      this.isLandscape = true;
    }


    this.saleForm = fb.group({// We can set default values by passing in the corresponding value or leave blank if we wish to not set the value. For our example, we’ll default the gender to female.
      storename: new FormControl({ value: ''}, Validators.required),
      mobile: new FormControl(null, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])),
      fullname: new FormControl({ value: '' }),
      billAmount: new FormControl(null, Validators.required),
      tax: new FormControl({ value: 0, disabled: true }, Validators.required),
      disc: new FormControl({ value: 0 }),
      includingTax: new FormControl({ value: '' }),
      earnedPoints: new FormControl({ value: 0 }, Validators.required),
      fbill: new FormControl({value:0}, Validators.required),
      billAfterDiscount: new FormControl(null, Validators.required),
      chainId: new FormControl(null, Validators.required),
      storeId: new FormControl(null, Validators.required),
      amountPaid: new FormControl(null, Validators.required),
      rew: new FormControl(null, Validators.required),
      useUserBalance: new FormControl(null, Validators.required),
      useUserRewards: new FormControl(null, Validators.required),
      deductedBalance: new FormControl(null, Validators.required),
      deductedRewards: new FormControl(null, Validators.required),
      billType: new FormControl(null, Validators.required),
      cartItems: new FormControl(null),
      userPin: new FormControl(null)
    });

    this.data = this.navParams.data.storeInfo;
    this.saleForm.patchValue({ 'storename': this.data.name, 'mobile': '', 'tax': 0, 'disc': 0.0, 'modelCheck': false, 
      'earnedPoints': 0, 'chainId': this.data.chainId, 'billAfterDiscount': 0, 'billType': 'direct', 'cartItems': [],
      'storeId': this.data._id, 'rew': 0.0, 'billAmount': 0.0, 'amountPaid': 0.0, 'deductedBalance': 0, 'deductedRewards': 0, 'userPin' : null });
    if (this.navParams.data.cartBilling) {
      this.saleForm.patchValue({ 'billAmount': this.navParams.data.finalBill, 'billType': 'cart', 'cartItems': this.navParams.data.cartItems })
      this.computeFBill()
    }
  }

  ionViewDidLoad() {
    this.localStorage.getItem('statsdata').then((data)=>{
      this.statsData = data;
    })
  }

  ionViewWillEnter() {
    this.localStorage.pages[2].visible = true;
    this.localStorage.pages[3].visible = true;
    this.localStorage.pages[6].visible = true;
  }

  ionViewWillLeave() {
    this.localStorage.pages[2].visible = false;
    this.localStorage.pages[3].visible = false;
    this.localStorage.pages[6].visible = false;
  }

  addSale() {
    this.saleForm.patchValue({ 'amountPaid': Number(this.amountPaid), 'useUserRewards': this.useUserRewards, 'useUserBalance': this.useUserBalance })
    if (this.useUserBalance) {
      this.saleForm.patchValue({ 'deductedBalance': this.deductedBalance });
    }
    if(this.useUserRewards) {
      this.saleForm.patchValue({ 'deductedRewards': this.deductedRewards });
    }

    this.validateForm()

  }

  sendTransaction() {
    let ramount = this.saleForm.value['rew']
    let damount = this.saleForm.value['disc']
    if (this.rewardtype == "Percentage") {
      ramount = this.rewardAmount;
    }
    if (this.disctype == "Percentage") {
      damount = this.discAmount;
    }
    let msg = '<div>  User: ' + this.saleForm.value['mobile'] + '<br> Bill Value: ' + this.saleForm.value['billAmount'] + '<br> Discount: ' + damount + '<br> Reward Points: ' + ramount + '<br> Final Bill: ' + this.saleForm.value['fbill'] + '</div>';
    let alert = this.alertCtrl.create({
      title: 'Confirmation',
      message: msg,
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
          return;
        }
      },
      {
        text: 'Ok',
        handler: data => {
          let loader = this.loadingCtrl.create({
            content: "Processing...",
            duration: 6000
          });
          loader.present();
          if (this.rewardtype == "Percentage") {
            this.saleForm.patchValue({ 'rew': this.rewardAmount })
          }
          if (this.disctype == "Percentage") {
            this.saleForm.patchValue({ 'disc': this.discAmount })
          }
          this.retailers.addSale(this.saleForm.value).subscribe(
            response => {
              if (response.success) {
                let msg = 'Transaction Successful!! <br> Charge: ' + response.charge + 'pts';
                let alert = this.alertCtrl.create({
                  title: 'Success!',
                  message: msg,
                  buttons: ['OK']
                });
                alert.present();
                this.saleForm.reset();
                this.saleForm.patchValue({
                  'storename': this.data.name, 'mobile': '', 'tax': 0, 'disc': 0.0, 'modelCheck': false,
                  'earnedPoints': 0, 'chainId': this.data.chainId,
                  'storeId': this.data._id, 'rew': 0.0, 'billAmount': 0.0, 'amountPaid': 0.0, 'deductedBalance': 0, 'deductedRewards': 0
                });
                this.finalBill = 0;
                this.amountPaid = 0;
                this.userBalance = 0;
                this.userRewards = 0;
                this.rewardAmount = 0;
                this.discAmount = 0;
                this.class = 'largedefault';
                if (this.navParams.data.cartBilling) {
                  this.navParams.get("parent").cleanItems();
                }
              }
              else {
                this.handleError()
              }
              loader.dismiss();
            },
            error => {
              this.handleError()
              loader.dismiss();
            });
        }
      }]
    });
    alert.present();
  }

  validateForm() {
    if (!this.saleForm.value['mobile'] || !(/^\d{10}$/.test(this.saleForm.value['mobile']))) {
      let alert = this.alertCtrl.create({
        message: 'Enter a valid mobile number',
        buttons: ['OK']
      });
      alert.present();
    }

    else if (!this.saleForm.value['billAmount'] || !(/\S/.test(this.saleForm.value['billAmount']))) {
      let alert = this.alertCtrl.create({
        message: 'Enter valid Billing amount',
        buttons: ['OK']
      });
      alert.present();
    }

    else if (this.saleForm.value['amountPaid'] < this.saleForm.value['fbill']) {
      let alert = this.alertCtrl.create({
        message: 'Amount paid is less than the final bill. Do you still want to continue?',
        buttons: [{
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            return
          }
        },
        {
          text: 'Yes',
          handler: data => {
            this.sendTransaction()
          }
        }]
      });
      alert.present();
    }
    else {
      this.sendTransaction();
    }
  }

  validateMobile() {
    let mobile = this.saleForm.value['mobile'];
    if(mobile.length < 10) {
      this.class = 'largedefault';
      this.userBalance = 0;
      this.userRewards = 0;
    }
    if (/^\d{10}$/.test(this.saleForm.value['mobile'])) {
      this.searchUser()
    }
    else if (mobile != null && mobile.length == 0) {
      return;
    }  
  }

  searchUser() {
    let mobile = this.saleForm.value['mobile'];
    this.class = 'largedefault';
    this.userBalance = 0;
    this.userRewards = 0;
    this.userExists = false;
    this.veryNewUser = false;
    this.grazieUser = false;
    this.pinEntered = false;
    this.pinverify = false;
    this.otpverify = false;
    this.qrverify = false;
    this.userBalance = 0.0; this.useUserBalance = false; this.userRewards = 0.0; this.useUserRewards = false;
    this.disableBalance = true;
    this.saleForm.patchValue({
      'storename': this.data.name, 'tax': 0, 'disc': 0.0, 'modelCheck': false,
      'earnedPoints': 0, 'chainId': this.data.chainId,
      'storeId': this.data._id, 'rew': 0.0, 'amountPaid': 0.0, 'deductedBalance': 0, 'deductedRewards': 0
    });
    this.finalBill = 0;
    this.amountPaid = 0;
    this.rewardAmount = 0;
    this.discAmount = 0;
    this.validOffers = [];
    this.userType = 0;
    this.class = 'largedefault';

    if (mobile.length == 10) {
      this.grazieUser = false;
      this.veryNewUser = false;
      let loader = this.loadingCtrl.create({
        content: "Getting user...",
        duration: 6000
      });
      this.retailers.searchUser(mobile).subscribe(
        response => {
          this.userExists = Boolean(response.exists);
          if (response && this.userExists && response.success) {
            this.class = 'largebronze';
            this.userType = 1;
            this.retailers.getRewardUser(mobile).subscribe(data=> {
              if(data) {

                if (data.transactionCount >= this.statsData.transMedianGold || data.totalSales >= this.statsData.salesMedianGold) {
                  this.class = 'largegold';
                  this.userType = 3;
                }
                else if (data.transactionCount > this.statsData.transMedianSilver || data.totalSales > this.statsData.salesMedianSilver) {
                  this.class = 'largesilver';
                  this.userType = 2;
                }
                this.userBalance = data.balanceBill;
                this.userRewards = data.remainingPoints;
                if(this.userBalance !=0 || this.userRewards !=0) {
                  this.grazieUser = true;
                }
                this.computeFBill()
              }
              loader.dismiss();						
            },
            error=>{
              console.log(error)
              loader.dismiss();
            })
          }
          else if (response && !this.userExists && response.success) {
            this.grazieUser = true;
          }
          else if (response && !this.userExists && !response.success) {
            this.veryNewUser = true;
          }
        },
        error => {
          loader.dismiss();
        });
    }
  }

  verifyUser(msg) {
    this.pinverify = false;
    this.otpverify = false;
    this.qrverify = false;
    this.disableBalance = true;
    if(msg=='pin') {
      let pinModal = this.modalCtrl.create(PinScreenPage, { newpin: false });
      pinModal.onDidDismiss(data => {
        if (data) {
          let info = {
            mobile: this.saleForm.value['mobile'],
            pin: data
          }
          this.commonService.verifyUserPin(info).then(response=>{
            if (response && response.success) {
              this.pinverify = true;
              this.disableBalance = false;
            }
            else if (response && !response.success) {
              this.handleVerifyError('Wrong PIN entered')
            }
            else {
              this.handleVerifyError('Could not verify user by PIN')
            }
          }, err=>{
            this.handleVerifyError('Could not verify user by PIN')
          })
        }
      })
      pinModal.present();
    }
    else if(msg=='otp') {
      let mobile = this.saleForm.value['mobile'];
      if (mobile.length < 10) {
        return;
      }
      let loader = this.loadingCtrl.create({
        content: "Authenticating...",
        duration: 6000
      });
      loader.present();
      this.commonService.generateOTP(mobile).subscribe(
        data => {
          this.showPrompt(mobile);
          loader.dismiss();
        },
        error => {
          this.handleError()
          loader.dismiss();
        });
    }
    else if(msg=='qr') {
      this.barcodeScanner.scan().then(barcodeData => {
        console.log('Barcode data', barcodeData);
        if (barcodeData && !barcodeData.cancelled) {
          let info = {
            mobile: this.saleForm.value['mobile'],
            qr: barcodeData.text
          }
          this.commonService.verifyUserQr(info).then(response => {
            if (response && response.success) {
              this.qrverify = true;
              this.disableBalance = false;
            }
            else if (response && !response.success) {
              this.handleVerifyError('QR code did not match!!')
            }
            else {
              this.handleVerifyError('Could not verify user by QR_SCAN')
            }
          }, err => {
            this.handleVerifyError('Could not verify user by QR_SCAN')
          })
        }
      }).catch(err => {
        console.log('Error', err);
      });
    }
  }

  showPrompt(mobile) {
    let prompt = this.alertCtrl.create({
      title: 'Verify',
      message: 'Enter otp',
      inputs: [
        {
          name: 'code',
          placeholder: 'Code'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            return;
          }
        },
        {
          text: 'Verify',
          handler: data => {
            let info = {
              mobile: this.saleForm.value['mobile'],
              otp: data.code
            }
            this.commonService.verifyUserOtp(info).then(response => {
              if (response && response.success) {
                this.otpverify = true;
                this.disableBalance = false;
              }
              else if (response && !response.success && response.status) {
                this.handleVerifyError(response.status)
              }
              else {
                this.handleVerifyError('Could not verify user by OTP')
              }
            }, err => {
              this.handleVerifyError('Could not verify user by OTP')
            })
          }
        }
      ]
    });
    prompt.present();
  }

  handleVerifyError(msg) {
    let alert = this.alertCtrl.create({
      title: 'Error!',
      message: msg,
      buttons: ['OK']
    });
    alert.present();
  }

  toggleIncludeTax() {
    this.includeTax = !this.includeTax;

    if (!this.saleForm.get('includingTax').value) {
      this.saleForm.get('tax').enable()
    }
    else {
      this.saleForm.get('tax').disable()
    }
  }

  scanAndPay() {
    console.log('choosen scan and pay')
  }

  changeInput(val:string) {
    this.currentChange = val;
    var str = val + 'class';
    if (this.currentChange == 'billAmount') {
      this.discclass = 'item'; this.amountclass = 'item'; this.mobileclass = 'item';
      this.billAmountclass = str; this.rewclass = 'item';
    }
    else if (this.currentChange == 'disc') {
      this.discclass = str; this.amountclass = 'item'; this.mobileclass = 'item';
      this.billAmountclass = 'item'; this.rewclass = 'item';
    }
    else if (this.currentChange == 'rew') {
      this.discclass = 'item'; this.amountclass = 'item'; this.mobileclass = 'item';
      this.billAmountclass = 'item'; this.rewclass = str;
    }
    else if (this.currentChange == 'amount') {
      this.discclass = 'item'; this.amountclass = str; this.mobileclass = 'item';
      this.billAmountclass = 'item'; this.rewclass = 'item';
    }
    else if (this.currentChange == 'mobile') {
      this.discclass = 'item'; this.amountclass = 'item'; this.mobileclass = str;
      this.billAmountclass = 'item'; this.rewclass = 'item';
    }

  }

  addNum(ch: string) {
    let fbill = this.saleForm.value['fbill'];
    if(ch=='<') {
      if (this.currentChange == 'mobile') {
        let mobile = this.saleForm.value['mobile'];
        mobile = mobile.substring(0, mobile.length - 1);
        this.saleForm.patchValue({ 'mobile': mobile });
        this.class = 'largedefault';
      }
      else if (this.currentChange == 'billAmount') {
        let billAmount = this.saleForm.value['billAmount'];
        if (this.decimalBill > 1) {
          this.decimalBill = this.decimalBill / 10;
          billAmount = Math.floor(billAmount * this.decimalBill) / this.decimalBill;
        }
        else {
          billAmount = Math.floor(billAmount / 10);
        }

        this.saleForm.patchValue({ 'billAmount': billAmount });
      }
      else if (this.currentChange == 'disc') {
        let disc = this.saleForm.value['disc'];
        if (this.decimalBill > 1) {
          this.decimalBill = this.decimalBill / 10;
          disc = Math.floor(disc * this.decimalBill) / this.decimalBill;
        }
        else {
          disc = Math.floor(disc / 10);
        }
        this.saleForm.patchValue({ 'disc': disc });
      }
      else if (this.currentChange == 'rew') {
        let rew = this.saleForm.value['rew'];
        if (this.decimalBill > 1) {
          this.decimalBill = this.decimalBill / 10;
          rew = Math.floor(rew * this.decimalBill) / this.decimalBill;
        }
        else {
          rew = Math.floor(rew / 10);
        }
        this.saleForm.patchValue({ 'rew': rew });
      }
      else if (this.currentChange == 'amount') {
        let amountPaid = this.amountPaid;
        if (this.decimalAmount > 1) {
          this.decimalAmount = this.decimalAmount / 10;
          amountPaid = Math.floor(amountPaid * this.decimalAmount) / this.decimalAmount;
        }
        else {
          amountPaid = Math.floor(amountPaid / 10);
        }
        this.amountPaid = amountPaid;
      }
    }
    else if (ch=='.') {
      if (this.currentChange == 'billAmount' && this.decimalBill === 1) {
        this.decimalBill = 10;
      }
      else if (this.currentChange == 'disc' && this.decimalDisc === 1) {
        this.decimalDisc = 10;
      }
      else if (this.currentChange == 'rew' && this.decimalRew === 1) {
        this.decimalRew = 10;
      }
      else if (this.currentChange == 'amount' && this.decimalAmount === 1) {
        this.decimalAmount = 10;
      }
    }
    else {
      if (this.currentChange == 'mobile') {
        let mobile = this.saleForm.value['mobile'];
        if (mobile.length < 10) {
          this.class = 'largedefault';
          mobile = mobile + ch;
          this.saleForm.patchValue({ 'mobile': mobile });
        }
        if (mobile.length == 10) {
          this.validateMobile();
        }
      }
      else if (this.currentChange == 'billAmount' && this.decimalBill <= 10000) {
        let billAmount = this.saleForm.value['billAmount'];
        let temp = billAmount * Math.ceil(10 / this.decimalBill);
        billAmount = temp + (Number(ch) / this.decimalBill);
        if (this.decimalBill > 1) {
          this.decimalBill = this.decimalBill * 10;
        }
        this.saleForm.patchValue({ 'billAmount': Number(billAmount.toFixed(2)) });
      }
      else if (this.currentChange == 'disc' && this.decimalDisc <= 100) {
        let disc = this.saleForm.value['disc'];
        let temp = disc * Math.ceil(10 / this.decimalDisc);
        disc = temp + (Number(ch) / this.decimalDisc);
        if (disc < 100) {
          if (this.decimalDisc > 1) {
            this.decimalDisc = this.decimalDisc * 10;
          }
          this.saleForm.patchValue({ 'disc': Number(disc.toFixed(2)) });
        }
      }
      else if (this.currentChange == 'rew' && this.decimalRew <= 100) {
        let rew = this.saleForm.value['rew'];
        let temp = rew * Math.ceil(10 / this.decimalRew);
        rew = temp + (Number(ch) / this.decimalRew);
        if (rew < 100) {
          if (this.decimalRew > 1) {
            this.decimalRew = this.decimalRew * 10;
          }
          this.saleForm.patchValue({ 'rew': Number(rew.toFixed(2)) });
        }
      }
      else if (this.currentChange == 'amount') {
        let amountPaid = this.amountPaid;
        let temp = amountPaid * Math.ceil(10 / this.decimalAmount);
        amountPaid = temp + (Number(ch) / this.decimalAmount);
        if (this.decimalAmount > 1) {
          this.decimalAmount = this.decimalAmount * 10;
        }
        this.amountPaid = amountPaid;
      }
    }

    this.computeFBill();

  }

  checkAndComputeFBill(str) {
    if(str=='bal') {
      this.useUserBalance = !this.useUserBalance;
      console.log(this.useUserBalance)
      if(this.useUserBalance) {
        if (!this.veryNewUser && !this.pinverify && !this.otpverify && !this.qrverify) {
          this.useUserBalance = false;
          this.handleVerifyError('User must be verfied to use the previous balance')
          console.log(this.useUserBalance)
          return
        }
      }
    }
    else if (str == 'rew') {
      this.useUserRewards = !this.useUserRewards;
      if (this.useUserRewards) {
        if (!this.veryNewUser && !this.pinverify && !this.otpverify && !this.qrverify) {
          this.useUserRewards = false;
          this.handleVerifyError('User must be verfied to use the previous balance')
          return
        }
      }
    }
    this.computeFBill()
  }

  computeFBill() {   

    if (this.disctype == "Percentage") {
      this.finalBill = this.saleForm.value['billAmount'] * (100 - this.saleForm.value['disc']) / 100;
      let rew = this.saleForm.value['billAmount'] - this.finalBill;
      this.discAmount = Number(rew.toFixed(2));
    }
    else {
      this.finalBill = this.saleForm.value['billAmount'] - this.saleForm.value['disc'];
    }


    let billAfterDiscount = this.finalBill;
    let earnedPoints = this.finalBill * (this.saleForm.value['rew']) / 100;
    if (this.useUserRewards) {
      if (this.userRewards > this.finalBill) {
        this.deductedRewards = this.finalBill;
        this.finalBill = 0;
      }
      else {
        this.finalBill = this.finalBill - this.userRewards;
        this.deductedRewards = this.userRewards;
      }            
    }
    if (this.useUserBalance) {
      if (this.userBalance > this.finalBill) {
        this.deductedBalance = this.finalBill;
        this.finalBill = 0;
      }
      else {
        this.finalBill = this.finalBill - this.userBalance;
        this.deductedBalance = this.userBalance;
      }
    }        
    this.finalBill = Number(this.finalBill.toFixed(2));
    if(this.rewardtype == "Percentage") {
      let rew = this.finalBill * this.saleForm.value['rew'] / 100;
      this.rewardAmount = Number(rew.toFixed(2));
    }
    this.saleForm.patchValue({ 'fbill': this.finalBill, 'earnedPoints': earnedPoints, 'billAfterDiscount': billAfterDiscount });

    let bill = this.saleForm.value['billAmount']
    this.validOffers = []
    for (var i = this.data.offers.length - 1; i >= 0; i--) {
      if (bill >= this.data.offers[i].minBillValue){
        if (this.userType >= this.data.offers[i].targetCustomers) 
          this.validOffers.push(this.data.offers[i])
      }
    }

    this.amountPaid = this.finalBill;
  }

  rewardPopover(myEvent, type, str1, str2) {
    let params = [str1,str2];

    let popover = this.popoverCtrl.create(RewardType, params, { cssClass: 'plain-popover' });
    popover.onDidDismiss(data => {
      if(data) {
        if (type == 1) {
          if (data == 'Points') {
            this.rewardtype = data;
          }
          else if (data == 'Percentage') {
            this.rewardtype = data;
          }
        }
        else {
          if (data == 'Amount') {
            this.disctype = data;
          }
          else if (data == 'Percentage') {
            this.disctype = data;
          }
        }
        this.computeFBill()
      }
    });
    console.log('popover pressed')
    popover.present({
      ev: myEvent
    });
  }

  showOffers() {

    let popover = this.popoverCtrl.create(SelectOffer, this.validOffers, { cssClass: 'custom-popover-offerlist' });
    popover.onDidDismiss(data => {
      if(data) {
        var disc = 0;
        let bill = this.saleForm.value['billAmount']
        if (data.offerType == 'giftvoucher') {
          if (data.maxReddemPercent) {            
            disc = data.maxReddemPercent * bill / 100;
            disc = Number(disc.toFixed(2))
            disc = (disc > data.offerAmount) ? data.offerAmount : disc;  
          }
          else {
            disc = data.offerAmount;
          }
          disc = (disc > bill) ? bill : disc;
          this.disctype = "Amount"
          this.saleForm.patchValue({ 'disc': disc })
        }
        else if (data.offerType == 'regular') {
          if (data.offerAmount) {
            this.disctype = "Percentage"
            this.saleForm.patchValue({ 'disc': data.offerAmount })
          } 
        }

        if (data.CBinPercent) {
          this.saleForm.patchValue({ 'rew': data.CBinPercent })
          this.rewardtype = 'Percentage';
        }
        else if (data.CBinRupees) {
          this.saleForm.patchValue({ 'rew': data.CBinPercent })
          this.rewardtype = 'Points';
        }
        this.computeFBill()
      }
    });
    popover.present();
  }

  handleError() {
    let alert = this.alertCtrl.create({
      title: 'Error!',
      message: 'Action could not be completed due to internal error. Please contact support team if problem is occuring often',
      buttons: ['OK']
    });
    alert.present();
  }

  openHelp(msg) {
    var helpAlert = this.alertCtrl.create({
      subTitle: msg,
      buttons: ['Ok']
    });
    helpAlert.present();
  }

  createPin() {
    let pinModal = this.modalCtrl.create(PinScreenPage, {newpin: true});
    pinModal.onDidDismiss(data=>{
      if(data) {
        console.log(data)
        this.pinEntered = true;
        this.saleForm.patchValue({'userPin':data})
      }
    })
    pinModal.present();
  }

}


@Component({
  template: `
  <ion-list>
  <button *ngFor="let item of navdata" ion-item (click)="close(item)">{{item}}</button>
  </ion-list>
  `
})

export class RewardType {

  navdata = [];
  constructor(public viewCtrl: ViewController,
    public navParams: NavParams) {
    this.navdata = this.navParams.data;
  }

  close(str: string) {
    this.viewCtrl.dismiss(str);
  }
}

@Component({
  template: `
  <ion-list>
  <button *ngFor="let item of navdata" ion-item (click)="close(item)">{{item.offerString}}</button>
  </ion-list>
  `
})

export class SelectOffer {

  navdata = [];
  constructor(public viewCtrl: ViewController,
    public navParams: NavParams) {
    this.navdata = this.navParams.data;
  }

  close(str: string) {
    this.viewCtrl.dismiss(str);
  }
}