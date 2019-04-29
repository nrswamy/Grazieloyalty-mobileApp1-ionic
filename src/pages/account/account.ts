import { Component } from '@angular/core';
import { NavController, NavParams, Platform, ModalController, ViewController } from 'ionic-angular';
import { RetailerService, CommonService } from '../../providers/index';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { SocketioProvider } from '../../providers/socketio/socketio'
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { RechargePage } from '../recharge/recharge'
import * as myVars from '../../config';

@Component({
	selector: 'page-account',
	templateUrl: 'account.html',
})
export class AccountPage {

	user = null;
	curMail = "";
  uuid:string = "";
  awaitingPayment = false;
  validTill = null;
  packs = null;

  offerCount = -1;
  monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  paymentText = "\"Pending Confirmation\"";

  constructor(public navCtrl: NavController, 
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    public navParams: NavParams,
    public platform: Platform,
    private iab: InAppBrowser,
    public loadingCtrl: LoadingController,
    private retailers: RetailerService,
    private io: SocketioProvider,
    private uniqueDeviceID: UniqueDeviceID,
    private cs: CommonService) {
    this.getCurrentBalance();

    let plts = this.platform.platforms();
    var temp = ''

    for (var i = 0; i < plts.length; i++) {
      temp = temp + plts[i]
    }

    this.uuid = temp;
    this.uniqueDeviceID.get()
    .then((uuid: any) => this.uuid = temp + uuid)
    .catch((error: any) => console.log(error));

  }

  ionViewDidEnter() {
    this.awaitingPayment = false;
    this.io.connectServer();
  }

  ionViewWillLeave() {
    this.io.disconnectServer();
  }

  getCurrentBalance() {
    let loader = this.loadingCtrl.create({
      content: "Processing...",
      duration: 6000
    });
    loader.present();
    var count = 0;
    this.retailers.getRetailerInfo().subscribe((data) => {
      count = count + 1;
      if(count == 3) {
        loader.dismiss()
      }
      if(data && data.success) {
        this.user = data.info;
        if (!this.user.email) {
          this.user.email = "";
        }
        try {
          if (this.user.currentPack != 'Free') {
            let date = new Date(this.user.validityTill);
            this.validTill = '' + date.getDate() + ' ' + this.monthNames[date.getMonth()] + ', ' + date.getFullYear();
          }
        }
        catch (e) {
          console.log('err=>' + e)
        }
      }
    },
    (err)=>{
      console.log(err)
    })

    this.retailers.getOfferCount().subscribe((data)=>{
      count = count + 1;
      if (count == 3) {
        loader.dismiss()
      }
      if(data && data.success) {
        this.offerCount = data.count;
      }
    })

    this.cs.getPackDetails().then((data) => {
      count = count + 1;
      if (count == 3) {
        loader.dismiss()
      }
      if (data.success && data.packs) {
        this.packs ={}
        for (var i = data.packs.length - 1; i >= 0; i--) {
          this.packs[data.packs[i].packName] = [data.packs[i].packDetails.free_credits, data.packs[i].packDetails.offers];
        }
      }
    }, (err) => {
      console.log(err)
    })
  }

  openPay() {
    this.user.uuid = this.uuid;
    let rechargeModal = this.modalCtrl.create(RechargePage, this.user);
    rechargeModal.onDidDismiss((data)=>{
      if(data) {
        this.awaitingPayment = true;
      }
    })
    
    rechargeModal.present();

    this.io.getPayMessages().subscribe(message => {
      if (message == 'success') {
        this.paymentText = "\"Success\""
        this.getCurrentBalance();
      }
      else if (message == 'failed') {
        this.paymentText = "\"Transaction Failed\""
      }
    });
  }

  updatePack() {
    try{
      let alert = this.alertCtrl.create({
        title: 'Update Current Pack',
        inputs: [
        {
          type: 'radio',
          label: 'Silver Pack',
          value: 'Silver',
          checked: (this.user.currentPack.packName == 'Silver')
        },
        {
          type: 'radio',
          label: 'Premium Pack',
          value: 'Premium',
          checked: (this.user.currentPack.packName == 'Premium')
        }
        ],
        buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            //console.log('Cancel clicked');
          }
        },
        {
          text: 'Update',
          handler: data => {
            let packs = {
              Free:0,
              Silver:1,
              Premium:2
            }
            let msg = ''
            console.log(this.user.currentPack)
            if (packs[data] > packs[this.user.currentPack.packName]) {
              msg = 'Do you want to upgrade your account to ' + data + '?';
              if (data != this.user.currentPack.packName) {
                let confirm = this.alertCtrl.create({
                  title: 'Confirm!',
                  subTitle: msg,
                  buttons: [{
                    text: 'No',
                    handler: response => {
                    }
                  },
                  {
                    text: 'Yes',
                    handler: response => {
                      this.changePack(data)
                    }
                  }
                  ]
                });
                confirm.present();
              }
            }
            else if (packs[data] < packs[this.user.currentPack.packName]) {
              msg = 'Do you want to downgrade your account to ' + data + '?';
              let offercount = 10000000000;

              try {
                if (/^[0-9]{1,10}$/.test(this.packs[data][1])) {
                  offercount = Number(this.packs[data][1])
                }
              }
              catch (e) {
                console.log('offer retrieve error => ', e)
              }

              if (this.offerCount > offercount) {
                let msg = 'You currently have ' + this.offerCount + ' active offers running which is beyond the limit for ' + data + ' pack.'
                let confirm = this.alertCtrl.create({
                  title: 'Error',
                  subTitle: msg,
                  buttons: [
                  {
                    text: 'Ok',
                    handler: data => {
                      //confirm.dismiss()
                    }
                  }
                  ]
                });
                confirm.present();
              }
              else {
                if (data != this.user.currentPack.packName) {
                  let confirm = this.alertCtrl.create({
                    title: 'Confirm!',
                    subTitle: msg,
                    buttons: [{
                      text: 'No',
                      handler: response => {
                        //confirm.dismiss()
                      }
                    },
                    {
                      text: 'Yes',
                      handler: response => {
                        this.changePack(data)
                      }
                    }
                    ]
                  });
                  confirm.present();
                }
              }
            }
          }
        }
        ]
      });
      alert.present();
    }
    catch (e) {
      console.log(e)
    }
  }

  changePack(toPack) {
    let loader = this.loadingCtrl.create({
      content: "Processing...",
      duration: 6000
    });
    loader.present();

    let data = {
      newPack: toPack
    }
    this.retailers.updatePack(data).then((data)=>{
      loader.dismiss();
      if(data && data.success) {
        this.user = data.user;
        let date = new Date(this.user.validityTill);
        this.validTill = '' + date.getDate() + ' ' + this.monthNames[date.getMonth() - 1] + ', ' + date.getFullYear();
        let confirm = this.alertCtrl.create({
          title: 'Congratulations!',
          subTitle: 'Your pack is successfully updated.',
          buttons: [
          {
            text: 'Ok'
          }
          ]
        });
        confirm.present();
      }
    })
  }

  updateName() {
    let alert = this.alertCtrl.create({
      title: 'Name',
      inputs: [
      {
        name: 'fullname',
        placeholder: this.user.fullname
      }
      ],
      buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Update',
        handler: data => {
          this.updateProfileName(data.fullname)
        }
      }
      ]
    });
    alert.present();
  }

  updateProfileName(name) {
    let loader = this.loadingCtrl.create({
      content: "Processing...",
      duration: 6000
    });
    loader.present();
    let updateData = {
      "id":this.user._id,
      "fullname": name
    }
    this.retailers.updateProfileName(updateData).then((response)=>{
      loader.dismiss()
      if(response.success) {
        this.user.fullname = response.user.fullname;
      }
    }, (err) => {
      console.log(err)
    })
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  }

  updateEmail() {
    if(this.curMail == '') {
      this.curMail = this.user.email;
    }
    let alert = this.alertCtrl.create({
      title: 'Email',
      inputs: [
      {
        name: 'email',
        placeholder: this.curMail
      }
      ],
      buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
          //console.log('Cancel clicked');
        }
      },
      {
        text: 'Update',
        handler: data => {
          this.curMail = data.email;
          if (this.validateEmail(data.email)) {
            this.updateProfileEmail(data.email)
          }
          else {						
            let confirm = this.alertCtrl.create({
              title: 'Error',
              subTitle: 'Please enter a valid Email address',
              buttons: [
              {
                text: 'Ok',
                handler: data => {
                  this.updateEmail();
                }
              }
              ]
            });
            confirm.present();
          }
        }
      }
      ]
    });
    alert.present();
  }

  updateProfileEmail(email) {

    let loader = this.loadingCtrl.create({
      content: "Processing...",
      duration: 6000
    });
    loader.present();

    this.retailers.searchRetailerbyEmail(email).then((response)=>{
      loader.dismiss()
      if(response && response.success) {
        if(response.exists && (this.user.email != email)) {
          let confirm = this.alertCtrl.create({
            title: 'Error',
            subTitle: email + ' is already registered with another user.',
            buttons: ['Ok']
          });
          confirm.present();
        }
        else {
          let loader = this.loadingCtrl.create({
            content: "Processing...",
            duration: 6000
          });
          loader.present();
          let updateData = {
            "id": this.user._id,
            "email": email
          }
          this.retailers.updateProfileEmail(updateData).then((response) => {
            loader.dismiss()
            if (response.success) {
              this.user.email = response.user.email;
              let confirm = this.alertCtrl.create({
                title: 'Success',
                subTitle: 'Update successful!',
                buttons: ['Ok']
              });
              confirm.present();
            }
          }, (err) => {
            console.log(err)
            let confirm = this.alertCtrl.create({
              title: 'Error',
              subTitle: 'Update failed. Please try again later.',
              buttons: ['Ok']
            });
            confirm.present();
          })
        }
      }
      else {
        this.handleError();
      }
    }, (err)=>{
      this.handleError();
    })

  }

  updateMobile() {
    let alert = this.alertCtrl.create({
      title: 'Mobile Number',
      inputs: [
      {
        name: 'mobile',
        placeholder: this.user.mobile_no,
        type: 'number'
      }
      ],
      buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Update',
        handler: data => {
          let mobile = data.mobile;
          if (/^\d{10}$/.test(mobile)) {
            let loader = this.loadingCtrl.create({
              content: "Processing...",
              duration: 6000
            });
            loader.present();
            this.retailers.searchRetailerbyMob(mobile).then((data)=>{
              loader.dismiss()
              if(!data.exists && data.success) {
								// value is ok, use it
								this.verifyPw(mobile)
							}
							else if (data.exists && data.success) {
								let confirm = this.alertCtrl.create({
									title: 'Error',
									subTitle: 'This mobile number is already registered.',
									buttons: ['Ok']
								});
                confirm.present();
							}
							else {
								this.handleError()
							}
						},(err)=>{
							this.handleError()
						})							
          }
          else {
            let confirm = this.alertCtrl.create({
              title: 'Error',
              subTitle: 'Invalid mobile number',
              buttons: ['Ok']
            });
            confirm.present();
          }						
        }
      }
      ]
    });
    alert.present();
  }

  verifyPw(mobile) {
    let alert = this.alertCtrl.create({
      subTitle: 'Please Re-Enter your password',
      inputs: [
      {
        name: 'pw',
        placeholder: 'password',
        type: 'password'
      }
      ],
      buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Ok',
        handler: data => {
          let password = data.pw;
          let loader = this.loadingCtrl.create({
            content: "Processing...",
            duration: 6000
          });
          loader.present();

          this.retailers.VerifyPw({ phrase: data.pw}).then((data)=>{
            loader.dismiss();
            if(data.success) {
              this.verifyMobile(mobile)
            }
            else {
              let confirm = this.alertCtrl.create({
                title: 'Error',
                subTitle: 'Oops! Looks like you have entered an invalid password',
                buttons: [{
                  text: 'Ok',
                  handler: data => {
                    this.verifyPw(mobile)
                  }
                }]
              });
              confirm.present();
            }            
          }, (err)=>{
            this.handleError()
          })
        }
      }
      ]
    });
    alert.present();
  }

  verifyMobile(mobile) {
    let loader = this.loadingCtrl.create({
      content: "Processing...",
      duration: 6000
    });
    loader.present();

    this.cs.generateOTP(mobile).subscribe(
      data => {
        this.showPrompt(mobile);
        loader.dismiss();
      },
      error => {
        this.handleError()
        loader.dismiss();
      });		
  }

  showPrompt(mobile) {
    let prompt = this.alertCtrl.create({
      title: 'Verify',
      message: 'Type code that was received via SMS',
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
          let loader = this.loadingCtrl.create({
            content: "Processing...",
            duration: 6000
          });
          loader.present();
          this.retailers.VerifyOtp({ mobile_no: mobile, otp: data.code }).then((data) => {
            if(data.success) {
              this.updateProfileMobile(mobile);
            }
            else {
              let confirm = this.alertCtrl.create({
                title: 'Error',
                subTitle: 'Invalid OTP!',
                buttons: [
                {text: 'Ok',
                handler: data => {
                  this.showPrompt(mobile)
                }}]
              });
              confirm.present();
            }						
            loader.dismiss();
          }, (err) => {
            this.handleError()
            loader.dismiss();
          })
        }
      }
      ]
    });
    prompt.present();
  }

  updateProfileMobile(mobile: string) {
    let updateData = {
      "mobile_no": mobile
    }
    let loader = this.loadingCtrl.create({
      content: "Processing...",
      duration: 6000
    });
    loader.present();
    this.retailers.updateProfileMobile(updateData).then((response) => {
      if (response.success) {
        this.user.mobile_no = response.user.mobile_no;
      }
      else {
        let confirm = this.alertCtrl.create({
          title: 'Error',
          subTitle: 'Oops! Looks like you have entered an invalid password',
          buttons: ['Ok']
        });
        confirm.present();
      }
      loader.dismiss()
    },
    (err) => {
      console.log(err)
      this.handleError()
      loader.dismiss()
    })
  }

  updatePassword() {
    let alert = this.alertCtrl.create({
      title: 'Update Password',
      inputs: [
      {
        name: 'old',
        placeholder: 'current password',
        type: 'password'
      },
      {
        name: 'new',
        placeholder: 'new password',
        type: 'password'
      },
      {
        name: 'confirm',
        placeholder: 'confirm password',
        type: 'password'
      }
      ],
      buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Update',
        handler: data => {
          let oldPassword = data.old;
          let newPassword = data.new;
          let confirmPassword = data.confirm;
          let loader = this.loadingCtrl.create({
            content: "Processing...",
            duration: 6000
          });
          loader.present();

          this.retailers.VerifyPw({ phrase: data.old }).then((data) => {
            if (data.success) {
              if (confirmPassword != newPassword) {
                let confirm = this.alertCtrl.create({
                  title: 'Error',
                  subTitle: 'Confirm password failed',
                  buttons: [{
                    text: 'Ok',
                    handler: data => {
                      this.updatePassword()
                      return;
                    }
                  }]
                });
                confirm.present();
              }
              if (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(newPassword)) {
                this.retailers.updatepw({ new: newPassword, deviceId: this.uuid }).then((response)=>{
                  let alert = this.alertCtrl.create({
                    title: 'Success!',
                    subTitle: 'Password updated',
                    buttons: ['OK']
                  });
                  alert.present();
                },
                (err)=>{
                  this.handleError();
                  return;
                })
              }
              else {
                let confirm = this.alertCtrl.create({
                  title: 'Invalid Password',
                  subTitle: 'Password should contain minimum six characters, at least one character and one number',
                  buttons: [{
                    text: 'Ok',
                    handler: data => {
                      this.updatePassword();
                      return;
                    }
                  }]
                });
                confirm.present();
              }
            }
            else {
              let confirm = this.alertCtrl.create({
                title: 'Error',
                subTitle: 'You have entered wrong current password',
                buttons: [{
                  text: 'Ok',
                  handler: data => {
                    this.updatePassword()
                    return;
                  }
                }]
              });
              confirm.present();
            }
            loader.dismiss();
          }, (err) => {
            this.handleError()
            loader.dismiss();
          })
        }
      }
      ]
    });
    alert.present();
  }  

  handleError() {
    let confirm = this.alertCtrl.create({
      title: 'Error',
      subTitle: 'Sorry, Unable to process your request.  Pleae try again later',
      buttons: ['Ok']
    });
    confirm.present();
  }

}
