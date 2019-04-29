import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { LocalstorageProvider } from '../../providers/localstorage/localstorage'
import { LoadingController, AlertController } from 'ionic-angular';
import { RetailerService } from '../../providers/retailer.service'

@Component({
	selector: 'page-settle',
	templateUrl: 'settle.html',
})
export class SettlePage {
	mobileNumber = ''; 
	settleAmount = 0;
	balanceAmount = 0;
	userExists: boolean;
	isLandscape = false;
	currentChange = 'mobile';
	decimalAmount = 1;
  storeId = null;
  notExist = false;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    private localStorage: LocalstorageProvider,
    private retailers: RetailerService,
    private alertCtrl: AlertController,
    public platform: Platform, ) {

    if (this.platform.is('tablet')) {
      this.isLandscape = true;
    }

    this.localStorage.getItem('currentStore').then((data) => {
      this.storeId = data._id;
    }).catch((err) => {
      console.log(err)
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettlePage');
  }

  settleCustomer() {

    if (!this.storeId) {
      let confirm = this.alertCtrl.create({
        title: 'Unknown Error',
        message: 'We are unable to process your request currently. Please contact the support team if this error is seen regularly.',
        buttons: ['Ok']
      });
      confirm.present();
      return;
    }

    let settleData = {
      mobile: this.mobileNumber,
      amountPaid: this.settleAmount,
      storeId: this.storeId
    }
    
    if(this.userExists) {
      let loader = this.loadingCtrl.create({
        content: "Processing...",
        duration: 6000
      });
      loader.present();
      this.retailers.settleCustomer(settleData).subscribe(
        response => {
          loader.dismiss();
          if (!response.success) {
            let confirm = this.alertCtrl.create({
              title: 'Failed',
              message: 'Transaction failed!',
              buttons: ['Ok']
            });
          }
          else {
            this.mobileNumber = '';
            this.balanceAmount = 0;
            this.settleAmount = 0;
            let confirm = this.alertCtrl.create({
              title: 'Success',
              message: 'Transaction is successfull!',
              buttons: ['Ok']
            });
            confirm.present();
          }					
        },
        error => {
          loader.dismiss();
          let confirm = this.alertCtrl.create({
            title: 'Failed',
            message: 'Transaction failed!',
            buttons: ['Ok']
          });
          confirm.present();					
        });
    }
    else {
      let confirm = this.alertCtrl.create({
        title: 'Failed',
        message: 'User is not your customer!',
        buttons: ['Ok']
      });
      confirm.present();  
    } 		
  }

  validateMobile() {
 		//console.log(this.saleForm.value)
 		let mobile = this.mobileNumber;
 		if (mobile.length < 10) {
 			//this.class = 'largedefault';
 		}
 		if (/^\d{10}$/.test(mobile)) {
 			// value is ok, use it
 			this.searchUser()
 		}
 		else if (mobile != null && mobile.length == 0) {
 			return;
 		}
 	}

 	searchUser() {
 		let mobile = this.mobileNumber;
 		if (mobile.length == 10) {
 			let loader = this.loadingCtrl.create({
 				content: "Getting user...",
 				duration: 6000
 			});
       this.balanceAmount = 0;
       this.settleAmount = 0;
       this.userExists = false;
       this.retailers.searchUser(mobile).subscribe(
         response => {
           this.userExists = Boolean(response.exists);
           this.retailers.getRewardUser(mobile).subscribe(data => {
             console.log(data)
             if (data) {
               this.balanceAmount = data.balanceBill;
             }
             loader.dismiss();
           },
           error => {
             console.log(error)
             loader.dismiss();
           })
         },
         error => {
           loader.dismiss();
 					//show alert that user does not exists
 				});
     }
   }

   scanAndPay() {
     console.log('choosen scan and pay')
   }

   changeInput(val: string) {
     this.currentChange = val;
   }

   addNum(ch: string) {
     if (ch == '<') {
       if (this.currentChange == 'mobile') {
         let mobile = this.mobileNumber;
         mobile = mobile.substring(0, mobile.length - 1);
         this.mobileNumber = mobile;
       }
       else if (this.currentChange == 'settleAmount') {
         let settleAmount = this.settleAmount;
         if (this.decimalAmount > 1) {
           this.decimalAmount = this.decimalAmount / 10;
           settleAmount = Math.floor(settleAmount * this.decimalAmount) / this.decimalAmount;
         }
         else {
           settleAmount = Math.floor(settleAmount / 10);
         }

         this.settleAmount = settleAmount;
       }
     }
     else if (ch == '.') {
       if (this.currentChange == 'settleAmount' && this.decimalAmount === 1) {
         this.decimalAmount = 10;
       }
     }
     else {
       if (this.currentChange == 'mobile') {
         let mobile = this.mobileNumber;
         if (mobile.length < 10) {
           mobile = mobile + ch;
           this.mobileNumber = mobile;
         }
         if (mobile.length == 10) {
           this.validateMobile();
         }
       }
       else if (this.currentChange == 'settleAmount' && this.decimalAmount <= 10000) {
         let settleAmount = this.settleAmount;
         let temp = settleAmount * Math.ceil(10 / this.decimalAmount);
         settleAmount = temp + (Number(ch) / this.decimalAmount);
         if (this.decimalAmount > 1) {
           this.decimalAmount = this.decimalAmount * 10;
         }
         this.settleAmount = Number(settleAmount.toFixed(4));
       }
     }

   }

 }