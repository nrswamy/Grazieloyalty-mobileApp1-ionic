import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';

import { GoogleauthProvider } from '../../providers/googleauth/googleauth'
import { CommonService } from '../../providers/common.service'
import { AlertController } from 'ionic-angular';
import { DashboardComponent } from '../dash/dashboard'
import { LocalstorageProvider } from '../../providers/localstorage/localstorage'
import { LoadingController } from 'ionic-angular';
import { LoginComponent } from '../login/login'
import { Register2Page } from '../register2/register2'
import { RetailerService } from '../../providers/index'

@Component({
	selector: 'page-register',
	templateUrl: 'register.html',
})
export class RegisterPage {

	data:any = {};
	registerForm: FormGroup;
	askNumber: boolean = false;
	verifyClicked: boolean = false;
	otpVerify: String;
	otpInput: String;
	invalidMobile = true;
	invalidPassword = true;
	userExists = true;
	userVerified = false;
	confirmPassword: string = '';
  uuid = '';

	constructor(public navCtrl: NavController, 
		public navParams: NavParams,
    public platform: Platform,
		private fb: FormBuilder,
		private googleAuth: GoogleauthProvider,
		private localStorage: LocalstorageProvider,
		public loadingCtrl: LoadingController,
    private uniqueDeviceID: UniqueDeviceID,
		private cs: CommonService,
		public alertCtrl: AlertController,
		private retailerService: RetailerService) {

		this.registerForm = fb.group({
			// We can set default values by passing in the corresponding value or leave blank if we wish to not set the value. For our example, we’ll default the gender to female.
			'email': [null],
			'fullname': [null, Validators.required],
			'mobile_no': [null, Validators.compose([Validators.required])],
			'password': [null, Validators.required]
		});

	}

  ionViewWillEnter() {
    let plts = this.platform.platforms();
    var temp = ''

    for (var i = 0; i < plts.length; i++) {
      temp = temp + plts[i]
    }

    this.uuid = temp;
    this.uniqueDeviceID.get()
      .then((uuid: any) => {
        this.uuid = temp + uuid;
      })
      .catch((error: any) => console.log(error));
  }

	googleSignUp() {
		let loader = this.loadingCtrl.create({
			content: "Authenticating...",
			duration: 6000
		});
		loader.present();

		this.googleAuth.login().then((response)=>{
			console.log('auth responded')
			this.googleAuth.verifyUser(response.email).then((res) => {
				console.log('google responded')
				if (res.exists) {
					console.log('google use exists')
					let user = res;
					this.localStorage.clearStorage()
					this.localStorage.setToken(user.token);
					this.localStorage.setItem('userData', user);
					loader.dismiss();
					this.navCtrl.setRoot(DashboardComponent);
				}
				else if (!res.success){
					console.log('result not success')
					console.log(res)
					this.googleAuth.logout();
					loader.dismiss();
					this.retryGoogleLogin();
				}
				else {
					console.log('result success')
					console.log(response)
					this.registerForm.patchValue({ 'fullname': response.displayName, 'email': response.email, 'mobile_no': '' })
					this.askNumber = true;
					loader.dismiss();
					this.navCtrl.push(Register2Page, this.registerForm.value);
				}
			}).catch(err => { loader.dismiss(); this.googleAuth.logout(); })
		}).catch(err => { loader.dismiss(); })
	}

	validatePassword() {
		this.invalidPassword = true;
		let password = this.registerForm.value.password;
		if (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)) {
			this.invalidPassword = false;
		}
	}

	validateMobile() {		
		this.invalidMobile = true;
		this.userVerified = false;
		let mobile = this.registerForm.value.mobile_no;
		if (/^\d{10}$/.test(mobile)) {
			// value is ok, use it
			this.invalidMobile = false;
			this.searchUser()
		}
		else if (mobile != null && mobile.length == 0) {
			return;
		}
	}

	checkPassword() {
		if (this.invalidPassword) {
			let alert = this.alertCtrl.create({
				message: 'Password should contain minimum six characters, at least one letter and one number',
				buttons: ['OK']
			});
			alert.present();
		}
	}

	searchUser() {
		if(this.invalidMobile) {
			let alert = this.alertCtrl.create({
				message: 'Invalid Mobile Number',
				buttons: ['OK']
			});
			alert.present();
		}
		else {

			let mobile: string = this.registerForm.value.mobile_no;
			this.retailerService.searchRetailerbyMob(mobile).then((response)=>{
				if(!response.success) {
					let confirm = this.alertCtrl.create({
						title: 'Error',
						message: 'Server is currently busy. Pelease try again after some time',
						buttons: ['Ok']
					});
					confirm.present();
				}
				else if(response.exists) {
					this.userExists = true;
					this.userVerified = true;
					let confirm = this.alertCtrl.create({
						message: 'Sorry, ' + this.registerForm.value.mobile_no + ' is already registered',
						buttons: ['OK']
					});
					confirm.present();
				}
				else {
					this.userExists = false;
					this.userVerified = true;
				}
			},
			(error)=>{
				let confirm = this.alertCtrl.create({
					title: 'Error',
					message: 'Server is currently busy. Pelease try again after some time',
					buttons: ['Ok']
				});
				confirm.present();
			})
		}
	}

	signUp() {
		console.log('signup')
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
		if (!this.registerForm.value.fullname) {
			let confirm = this.alertCtrl.create({
				title: 'Error',
				subTitle: 'Name cannot be empty',
				buttons: ['Ok']
			});
			confirm.present();
		}
		else if (this.userExists) {
			let confirm = this.alertCtrl.create({
				subTitle: 'Sorry, ' + this.registerForm.value.mobile_no + ' is already registered',
				buttons: ['OK']
			});
			confirm.present();
		}
		else if (this.invalidPassword) {
			let alert = this.alertCtrl.create({
				title: 'Invalid Password',
				subTitle: 'Password should contain minimum six characters, at least one letter and one number',
				buttons: ['OK']
			});
			alert.present();
		}
		else if (this.registerForm.value.password != this.confirmPassword) {
			let confirm = this.alertCtrl.create({
				title: 'Error',
				subTitle: 'Password\' did not match',
				buttons: ['Ok']
			});
			confirm.present();
		}
		else if (this.registerForm.valid && !this.userExists && this.userVerified) {
			console.log('form valid')
			this.navCtrl.push(Register2Page, this.registerForm.value);
		}
		else {
			let confirm = this.alertCtrl.create({
				title: 'Error',
				subTitle: 'Server is currently busy. Pelease try again after some time',
				buttons: ['Ok']
			});
			confirm.present();
		}
	}

	retryGoogleLogin() {
		let confirm = this.alertCtrl.create({
			title: 'Error',
			message: 'Server is currently busy. Pelease try again after some time',
			buttons: [
			{
				text: 'Ok',
				handler: () => {
					this.navCtrl.setRoot(LoginComponent);
				}
			},
			{
				text: 'Retry',
				handler: () => {
					this.googleSignUp()
				}
			}
			]
		});
		confirm.present();
	}

}
