import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, PopoverController } from 'ionic-angular';
import { StoreService } from '../../providers/store.service'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AlertController } from 'ionic-angular';
import { DatePipe } from '@angular/common';
import { LoadingController } from 'ionic-angular';
import { RewardType } from '../billing/billing'

/**
* Generated class for the OfferPage page.
*
* See http://ionicframework.com/docs/components/#navigation for more info
* on Ionic pages and navigation.
*/
@Component({
  selector: 'page-offer',
  templateUrl: 'offer.html',
})
export class OfferPage {

  offersForm: FormGroup;
  startdate: string;
  starttime = '00:00';
  enddate: string;
  endtime = '23:59';
  offerType = 'regular';
  rewardtype = 'Pts';
  updateForm = true;
  minDate: any;
  nextDate: any;
  addString = "Save";
  monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private storeService: StoreService,
    private fb: FormBuilder,
    public alertCtrl: AlertController,
    private datePipe: DatePipe,
    public popoverCtrl: PopoverController,
    private loading: LoadingController,
    public viewCtrl: ViewController
    ) {

    let loader = this.loading.create({
      content: "Please wait...",
      duration: 6000
    });
    loader.present();
    
    this.offersForm = fb.group({
      offerString: new FormControl(null),
      description: new FormControl(null),
      tandc: new FormControl(null),
      storeId: new FormControl(null),
      startDate: new FormControl(null),
      endDate: new FormControl(null),
      offerType: new FormControl(null),
      targetCustomers: new FormControl(null),
      cbinrupees: new FormControl(null),
      cbinpercent: new FormControl(null),
      offerAmount: new FormControl(null),
      minBillValue: new FormControl(null),
      maxReddemPercent: new FormControl(null),
      newOffer: new FormControl(null),
      oid: new FormControl(null)
    });
    
    loader.dismiss();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OfferPage');
  }

  ionViewDidEnter() {
    this.offersForm.reset()

    if (this.navParams.get('type') == "Save") {
      this.offersForm.patchValue({ 'targetCustomers': 0, 'newOffer': true, 'oid': null, 'cbinrupees': 0, 'cbinpercent':0 });
      var d = new Date();
      var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
      this.nextDate = new Date(utc);

      let enddate = new Date(utc+2592000000);
      this.minDate = this.datePipe.transform(this.nextDate, 'yyyy-MM-dd');

      this.startdate = this.minDate;
      this.enddate = this.datePipe.transform(enddate, 'yyyy-MM-dd');
    }
    else {
      let offer = this.navParams.get('offer')
      this.offerType = offer.offerType;
      this.offersForm.patchValue({ 'offerString': offer.offerString, 'description': offer.description, 'tandc': offer.tandc, 'storeId': offer.storeId, 'startDate': offer.startDate, 'endDate': offer.endDate, 'offerType': offer.offerType, 'targetCustomers': offer.targetCustomers, 'offerAmount': offer.offerAmount, 'minBillValue': offer.minBillValue, 'maxReddemPercent': offer.maxReddemPercent, 'newOffer': false, 'oid': offer._id })

      if (offer.CBinRupees) {
        this.offersForm.patchValue({ 'cbinrupees': offer.CBinRupees })
        this.rewardtype = 'Pts';
      }
      else if (offer.CBinPercent) {
        this.offersForm.patchValue({ 'cbinrupees': offer.CBinPercent })
        this.rewardtype = '%';
      }
      let today = Date.now() + 19800000;      
      let st = new Date(offer.startDate).getTime()
      if (today > st) {
        this.updateForm = false;
      }

      var utcs = new Date(offer.startDate).getTime()
      var utce = new Date(offer.endDate).getTime()

      var sdate = new Date(utcs)
      var edate = new Date(utce)

      this.startdate = this.datePipe.transform(new Date(utcs), 'yyyy-MM-dd')
      this.enddate = this.datePipe.transform(new Date(utce), 'yyyy-MM-dd')

      var n = sdate.getHours();
      var HH = ''
      if (n < 10) HH = HH + '0'
        HH = HH + n

      n = sdate.getMinutes();
      var mm = ''
      if (n < 10) mm = mm + '0'
        mm = mm + n
      this.starttime = '' + HH + ':' + mm

      n = edate.getHours();
      HH = ''
      if (n < 10) HH = HH + '0'
        HH = HH + n

      n = edate.getMinutes();
      mm = ''
      if (n < 10) mm = mm + '0'
        mm = mm + n
      this.endtime = '' + HH + ':' + mm

      this.addString = "Update";
    }
  }

  preview() {
    let title = '';
    let subtitle = '';
    if (this.offerType == 'regular') {
      if (!this.verifyRegularOffer()) {
        return;
      }
      title += this.offersForm.value['offerString']
      subtitle += this.offersForm.value['description']
    }
    else {
      if (!this.verifyGiftVoucher()) {
        return;
      }
      title += this.offersForm.value['offerString']

      if (this.offersForm.value['description'] && this.offersForm.value['description'].length) {
        subtitle += this.offersForm.value['description'];
      }
      else {
        subtitle += 'Rs.' + this.offersForm.value['offerAmount'] + ' woth voucher is waiting for you. '

        if (this.offersForm.value['minBillValue']) {
          subtitle = subtitle + 'This can be redeemed at store by making minimum bill value of Rs.' + this.offersForm.value['minBillValue']
        }
        else {
          subtitle = subtitle + 'This can be redeemed at store during your next visit.'
        }

        if (this.offersForm.value['maxReddemPercent']) {
          subtitle = subtitle + 'You can redeem upto a maximum of ' + this.offersForm.value['maxReddemPercent'] + '% of the bill value';
        }
      }     
       
    }
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['Ok']
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

  verifyRegularOffer() {

    if (!this.offersForm.value['offerString'] || !(/\S/.test(this.offersForm.value['offerString']))) {
      const alert = this.alertCtrl.create({
        title: 'Validation error!',
        subTitle: 'Offer &#039Title&#039 cannot be empty',
        buttons: ['Ok']
      });
      alert.present();
      return false;
    }

    if (!this.offersForm.value['offerAmount'] && !this.offersForm.value['cbinrupees']) {
      const alert = this.alertCtrl.create({
        title: 'Validation error!',
        subTitle: 'Either Discount or Cashback must be specified',
        buttons: ['Ok']
      });
      alert.present();
      return false;
    }

    if (!this.offersForm.value['minBillValue']) {
      this.offersForm.value['minBillValue'] = 0;
    }

    if (!this.offersForm.value['description'] || !(/\S/.test(this.offersForm.value['description']))) {
      const alert = this.alertCtrl.create({
        title: 'Validation error!',
        subTitle: 'Offer &#039Description&#039 cannot be empty',
        buttons: ['Ok']
      });
      alert.present();
      return false;
    }

    if (this.startdate == null || this.startdate == undefined) {
      const alert = this.alertCtrl.create({
        title: 'Validation error!',
        subTitle: 'Offer &#039Start Date&#039 cannot be empty',
        buttons: ['Ok']
      });
      alert.present();
      return false;
    }

    if (this.enddate == null || this.enddate == undefined) {
      const alert = this.alertCtrl.create({
        title: 'Validation error!',
        subTitle: 'Offer &#039End Date&#039 cannot be empty',
        buttons: ['Ok']
      });
      alert.present();
      return false;
    }

    return true;
  }

  verifyGiftVoucher() {

    if (!this.offersForm.value['offerString'] || !(/\S/.test(this.offersForm.value['offerString']))) {
      const alert = this.alertCtrl.create({
        title: 'Validation error!',
        subTitle: 'Offer &#039Title&#039 cannot be empty',
        buttons: ['Ok']
      });
      alert.present();
      return false;
    }

    if (!this.offersForm.value['offerAmount']) {
      const alert = this.alertCtrl.create({
        title: 'Validation error!',
        subTitle: 'Offer &#039Gift Voucher Amount&#039 cannot be empty',
        buttons: ['Ok']
      });
      alert.present();
      return false;
    }

    if (!this.offersForm.value['minBillValue']) {
      this.offersForm.value['minBillValue'] = 0;
    }

    if (!this.offersForm.value['maxReddemPercent']) {
      this.offersForm.value['maxReddemPercent'] = 100;
    }

    if (this.startdate == null || this.startdate == undefined) {
      const alert = this.alertCtrl.create({
        title: 'Validation error!',
        subTitle: 'Offer &#039Credit Date&#039 cannot be empty',
        buttons: ['Ok']
      });
      alert.present();
      return false;
    }

    if (this.enddate == null || this.enddate == undefined) {
      const alert = this.alertCtrl.create({
        title: 'Validation error!',
        subTitle: 'Offer &#039Expiry Date&#039 cannot be empty',
        buttons: ['Ok']
      });
      alert.present();
      return false;
    }

    let subtitle=''

    if (this.offersForm.value['description'] && this.offersForm.value['description'].length) {
      subtitle += this.offersForm.value['description'];
    }
    else {
      subtitle += 'Rs.' + this.offersForm.value['offerAmount'] + ' woth voucher is waiting for you. '

      if (this.offersForm.value['minBillValue']) {
        subtitle = subtitle + 'This can be redeemed at store by making minimum bill value of Rs.' + this.offersForm.value['minBillValue']
      }
      else {
        subtitle = subtitle + 'This can be redeemed at store during your next visit.'
      }

      if (this.offersForm.value['maxReddemPercent']) {
        subtitle = subtitle + 'You can redeem upto a maximum of ' + this.offersForm.value['maxReddemPercent'] + '% of the bill value';
      }

      this.offersForm.patchValue({ 'description': subtitle })
    }  
    

    return true;
  }

  rewardPopover(myEvent, type, str1, str2) {
    let params = [str1, str2];

    let popover = this.popoverCtrl.create(RewardType, params, { cssClass: 'plain-popover' });
    popover.onDidDismiss(data => {
      if (data) {
        if (type == 1) {
          if (data == 'Pts') {
            this.rewardtype = data;
          }
          else if (data == '%') {
            this.rewardtype = data;
          }
        }
      }
    });
    popover.present({
      ev: myEvent
    });
  }

  saveOffer() {
    let validOffer = false;
    if (this.offerType == 'regular') {
      validOffer = this.verifyRegularOffer();
    }
    else {
      validOffer = this.verifyGiftVoucher();
    }

    if (!validOffer) {
      console.log('invalid offer')
      return;
    }

    let rew = this.offersForm.value['cbinrupees']
    if(this.rewardtype == '%') {      
      this.offersForm.patchValue({ 'cbinrupees': 0, 'cbinpercent': rew });
    }
    else {
      this.offersForm.patchValue({ 'cbinrupees': rew, 'cbinpercent': 0 });
    }

    let se = this.datePipe.transform(this.startdate, 'yyyy-MM-dd') + 'T' + this.starttime + ':00.000';
    let de = this.datePipe.transform(this.enddate, 'yyyy-MM-dd') + 'T' + this.endtime + ':00.000';

    this.offersForm.patchValue({ 'startDate': se, 'endDate': de, 'offerType': this.offerType, 'storeId': this.navParams.get('storeId') })
    this.storeService.addOffer(this.offersForm.value).subscribe((data) => {
      this.dismiss()
      if (data && !data.success) {
        this.errorAlert()
      }
    },
    (error) => {
      console.log(error)
      this.errorAlert()
    })
  }

  dismiss() {
    this.viewCtrl.dismiss(true);
  }

  errorAlert() {
    const alert = this.alertCtrl.create({
      title: 'Error!',
      subTitle: 'An error was encountered during save. Please try again after some time.',
      buttons: ['Ok']
    });
    alert.present();
  }
}
