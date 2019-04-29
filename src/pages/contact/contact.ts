import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { CommonService, RetailerService } from '../../providers/index';

/**
* Generated class for the ContactPage page.
*
* See http://ionicframework.com/docs/components/#navigation for more info
* on Ionic pages and navigation.
*/
@Component({
	selector: 'page-contact',
	templateUrl: 'contact.html',
})
export class ContactPage {

	message = "";
	user = null;

	constructor(public navCtrl: NavController, 
		public navParams: NavParams,
		private retailers: RetailerService,
		private cs: CommonService,
		public alertCtrl: AlertController) {
		this.retailers.getRetailerInfo().subscribe((response)=>{
			if(response.success) {
				this.user = response.info;
			}
		},(err)=>{
			console.log(err)
		})
	}

	submit() {
		if ((/\S/.test(this.message)) && this.user) {
			let data = { message: this.message, name: this.user.fullname, mobile: this.user.mobile_no };
			this.cs.sendMessage(data).subscribe((data) => {
				let confirm = this.alertCtrl.create({
					title: 'Thank you!',
					subTitle: 'Your message has been sent to our customer management team.',
					buttons: ['Ok']
				});
				confirm.present();
			}, (err) => {
				console.log(err)
				let confirm = this.alertCtrl.create({
					title: 'Error!',
					subTitle: 'Your message could not be sent currently, please try again later.',
					buttons: ['Ok']
				});
				confirm.present();
			})
		}
	}

}
