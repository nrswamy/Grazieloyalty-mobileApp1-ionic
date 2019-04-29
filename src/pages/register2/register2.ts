import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { CommonService } from '../../providers/common.service'
import { RetailerService } from '../../providers/index'
import { DashboardComponent } from '../dash/dashboard'
import { StoremanagerComponent } from '../storemanager/storemanager'
import { LocalstorageProvider } from '../../providers/localstorage/localstorage'

declare var firebase: any;
declare var FirebasePlugin: any;
/**
* Generated class for the Register2Page page.
*
* See http://ionicframework.com/docs/components/#navigation for more info
* on Ionic pages and navigation.
*/

@Component({
	selector: 'page-register2',
	templateUrl: 'register2.html',
})
export class Register2Page {

	private formdata;
	private otpsent = false;
	private confirmPassword = '';
	invalidPassword = true;
	showpassword = true;
	otpVerify = '';
	invisible = true;
	invalidMobile = true;
	userVerified = false;
	userExists = true;
	ifNameRequired = false;

	constructor(public navCtrl: NavController,
		private cs: CommonService,
		public navParams: NavParams,
		public alertCtrl: AlertController,
		public loadingCtrl: LoadingController,
		private localStorage: LocalstorageProvider,
		private retailerService: RetailerService) {
	}

	ionViewCanEnter() {
		console.log('ionViewCanEnter Register2Page');
		this.formdata = this.navParams.data;
		console.log(this.formdata)
		if (this.formdata.mobile_no) {
			this.invalidMobile = false;
			this.userVerified = true;
			this.userExists = false;
		}

		if(!this.formdata.fullname) {
			this.ifNameRequired = true;
		}

		if (this.formdata.password) {
			this.showpassword = false;
			this.invalidPassword = false;
			this.confirmPassword = this.formdata.password;
		}
	}

	validatePassword() {
		this.invalidPassword = true;
		let password = this.formdata.password;
		if (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)) {
			this.invalidPassword = false;
		}
	}

	validateMobile() {
		//console.log(this.saleForm.value)
		this.invalidMobile = true;
		this.userVerified = false;
		let mobile = this.formdata.mobile_no;
		if (/^\d{10}$/.test(mobile)) {
			// value is ok, use it
			this.invalidMobile = false;
			this.searchUser()
		}
		else if (mobile != null && mobile.length == 0) {
			return;
		}
	}

	searchUser() {
		if (this.invalidMobile) {
			let alert = this.alertCtrl.create({
				message: 'Invalid Mobile Number',
				buttons: ['OK']
			});
			alert.present();
		}
		else {

			let mobile: string = this.formdata.mobile_no;
			this.retailerService.searchRetailerbyMob(mobile).then((response) => {
				if (!response.success) {
					let confirm = this.alertCtrl.create({
						title: 'Error',
						message: 'Server is currently busy. Pelease try again after some time',
						buttons: ['Ok']
					});
					confirm.present();
				}
				else if (response.exists) {
					this.userExists = true;
					this.userVerified = true;
					let confirm = this.alertCtrl.create({
						message: 'Sorry, ' + this.formdata.mobile_no + ' is already registered',
						buttons: ['OK']
					});
					confirm.present();
				}
				else {
					this.userExists = false;
					this.userVerified = true;
				}
			},
			(error) => {
				let confirm = this.alertCtrl.create({
					title: 'Error',
					message: 'Server is currently busy. Pelease try again after some time',
					buttons: ['Ok']
				});
				confirm.present();
			})
		}
	}

	sendOTP() {
		if (this.invalidMobile) {
			let confirm = this.alertCtrl.create({
				title: 'Error',
				subTitle: 'Invalid mobile number',
				buttons: ['Ok']
			});
			confirm.present();
			return;
		}
		if (!this.userVerified) {
			let confirm = this.alertCtrl.create({
				title: 'Error',
				message: 'Server is currently busy. Pelease try again after some time',
				buttons: ['Ok']
			});
			confirm.present();
			return;
		}
		if (!this.formdata.fullname) {
			let confirm = this.alertCtrl.create({
				title: 'Error',
				subTitle: 'Name cannot be empty',
				buttons: ['Ok']
			});
			confirm.present();
		}
		else if (this.userExists) {
			let confirm = this.alertCtrl.create({
				subTitle: 'Sorry, ' + this.formdata.mobile_no + ' is already registered',
				buttons: ['OK']
			});
			confirm.present();
		}
		else if (this.invalidPassword) {
			let alert = this.alertCtrl.create({
				title: 'Invalid Password',
				subTitle: 'Password should contain minimum six characters, at least one character and one number',
				buttons: ['OK']
			});
			alert.present();
		}
		else if (this.formdata.password != this.confirmPassword) {
			let confirm = this.alertCtrl.create({
				title: 'Error',
				subTitle: 'Password\'s did not match',
				buttons: ['Ok']
			});
			confirm.present();
		}
		else if (!this.otpsent) {
			this.otpsent = true;
			this.cs.generateOTP(this.formdata.mobile_no).subscribe(
				data => {
					this.showPrompt();
				},
				error => {
				});
		}
	}

	verifyOTP(otp: string) {
		this.formdata.otp = otp;
		let loader = this.loadingCtrl.create({
			content: "Authenticating...",
			duration: 6000
		});
		loader.present();
		this.retailerService.verifyAndSave(this.formdata).then((data: any) => {
			let res: any = data;

			if (res.success) {
				this.localStorage.clearStorage()
				this.localStorage.setToken(res.token);
				this.localStorage.setItem('userData', res);

				this.navCtrl.setRoot(StoremanagerComponent);
				loader.dismiss();
			}
		},
		(error) => {
			console.log(error)
			loader.dismiss();
		})
	}

	private showPrompt() {
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
					this.verifyOTP(data.code);
				}
			}
			]
		});
		prompt.present();
	}

}
