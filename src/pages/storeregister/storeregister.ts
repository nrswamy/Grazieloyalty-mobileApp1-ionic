import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, ViewController, NavParams, Searchbar } from 'ionic-angular';
import { StoreService, CommonService } from '../../providers/index';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Keyboard } from 'ionic-native';
import { StoremanagerComponent } from '../storemanager/storemanager';
import { LocalstorageProvider } from '../../providers/localstorage/localstorage'
import { GmapPage } from '../gmap-modal/gmap'
import { AlertController } from 'ionic-angular';

@Component({
	template: `
	<ion-header>
	<ion-toolbar>
	<ion-title>
	City/Town/Village
	</ion-title>
	<ion-buttons start>
	<button ion-button (click)="dismiss()">
	<span ion-text>Close</span>
	</button>
	</ion-buttons>
	</ion-toolbar>
	</ion-header>

	<ion-content>
	<ion-searchbar #searchBar [(ngModel)]="query" (ionInput)="getItems($event)" placeholder="City/Town"></ion-searchbar>
	<ion-list>
	<ion-item *ngFor="let item of items" (click)=close(item)>
	{{ item.region }}
	</ion-item>
	</ion-list>	
	</ion-content>

	<ion-footer>
	<ion-toolbar>
	<div style="text-align: center; ">
	<ion-buttons>
	<button ion-button block (click)="dismiss()">
	<span>Close</span>
	</button>
	</ion-buttons> 
	</div>
	</ion-toolbar>
	</ion-footer>
	`
})

export class SearchPage {
	@ViewChild('searchBar') searchBar: Searchbar;
	items = [];
	query = '';
	waitTimeOver = true;
	pendingSearch = false;

	constructor(public viewCtrl: ViewController,
		public navParams: NavParams,
		private commonService: CommonService
		) {

	}

	ionViewDidEnter() {
		setTimeout(() => {
			this.searchBar.setFocus();
		}, 150);
		Keyboard.show()
	}

	close(item: any) {
		this.viewCtrl.dismiss(item);
	}

	dismiss() {
		this.viewCtrl.dismiss(null);
	}

	getItems(ev: any) {
		// Reset items back to all of the items
		this.items = [];
		// set val to the value of the searchbar
		let val = ev.target.value;
		this.query = val;

		// if the value is an empty string don't filter the items
		if (val && val.trim() != '') {
			if (this.waitTimeOver) {
				this.waitTimeOver = false;
				setTimeout(() => {
					this.waitTimeOver = true;
					if (this.pendingSearch) {
						this.pendingSearch = false;
						this.commonService.searchCity(val).subscribe((data) => {
							this.items = data.data;
						})
					}
				}, 700);
				this.pendingSearch = false;
				this.commonService.searchCity(val).subscribe((data) => {
					this.items = data.data;
				})
			}
			else {
				this.pendingSearch = true;
			}
		}
	}
}

@Component({
	selector: 'storeregister',
	templateUrl: 'storeregister.html'
})
export class StoreRegisterComponent {

	storeForm: FormGroup;

	loading = false;
	isOwner = false;
	istcaccepted = false;
	states = [];
	address:any;
	waitTimeOver = true;
	pendingSearch = false;
	contacts = [];
	categories = [];

	constructor(private storeService: StoreService,
		private commonService: CommonService,
		private fb: FormBuilder,
		public navCtrl: NavController,
		public alertCtrl: AlertController,
		private modalCtrl:ModalController,
		private localStorage: LocalstorageProvider) {
		console.log('Hello StoreregisterComponent Component');

		this.storeForm = fb.group({
			// We can set default values by passing in the corresponding value or leave blank if we wish to not set the value. For our example, we’ll default the gender to female.
			'storename': [null, Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(30)])],
			'description': [null],
			'contactArray': [null],
			'category': [null],
			'address': [null, Validators.required],
			'zip': [null, Validators.required],
			'city': [null, Validators.required],
			'state': [null, Validators.required],
			'istcaccepted': [true, Validators.required],
			'chainId': [null, Validators.required],
      'isRef': [null, Validators.required],
      'ref': [null, Validators.required],
      'refBy': [null, Validators.required],
    });

		//this.storeForm.controls['city'].disable();
		this.storeForm.controls['state'].disable();
		this.storeForm.controls['zip'].disable();

    this.storeForm.patchValue({ 'contactArray': this.contacts, 'isRef': false })

    this.localStorage.getItem('userData').then((data)=>{
      this.storeForm.patchValue({'chainId':data.sid})
    })

		//this.getStateNames()

		this.address = {
			place: ''
		};

		this.getKeywords();
	}

	getKeywords() {
		this.commonService.getKeywords().subscribe(
			data => {
				this.categories = data[0].categories;
			},
			error => {
			});
	};

	showModal(){
		this.storeForm.controls['city'].disable();
		let searchModal = this.modalCtrl.create(SearchPage, {}, {
			cssClass: 'storeregister.scss'
		});
		searchModal.onDidDismiss(data => {
			if(data) {			
				this.storeForm.patchValue({ 'city': data.region, 'zip': data.zip.toString(), 'state':data.state })				
			}
			this.storeForm.controls['city'].enable();
		});

		searchModal.present();
	}

	showContactModal() {
		let contactModal = this.modalCtrl.create(AddContactModel, {items: this.contacts}, {
			cssClass: 'storeregister.scss'
		});
		contactModal.onDidDismiss(data => {
			if (data) {
				this.contacts = data;
				this.storeForm.patchValue({ 'contactArray': this.contacts })
			}
		});

		contactModal.present();
	}

	showLocPage() {
		this.storeForm.controls['state'].enable();
		this.storeForm.controls['zip'].enable();
		if (!this.storeForm.value['storename'] || this.storeForm.value['storename'].trim() == '') {
			let confirm = this.alertCtrl.create({
				subTitle: 'Sorry, ' + 'store name field cannot be empty',
				buttons: ['OK']
			});
			confirm.present();
		}
		else if (!this.storeForm.value['address'] || this.storeForm.value['address'].trim() == '') {
			let confirm = this.alertCtrl.create({
				subTitle: 'Sorry, ' + 'Locality field cannot be empty',
				buttons: ['OK']
			});
			confirm.present();
		}
		else if (!this.storeForm.value['city'] || this.storeForm.value['city'].trim() == '') {
			let confirm = this.alertCtrl.create({
				subTitle: 'Sorry, ' + 'city field cannot be empty',
				buttons: ['OK']
			});
			confirm.present();
		}
		else if (!this.storeForm.value['zip'] || this.storeForm.value['zip'].trim() == '') {
			let confirm = this.alertCtrl.create({
				subTitle: 'Sorry, ' + 'zipcode field cannot be empty',
				buttons: ['OK']
			});
			confirm.present();
		}
		else if (!this.storeForm.value['state']) {
			let confirm = this.alertCtrl.create({
				subTitle: 'Please select state.',
				buttons: ['OK']
			});
			confirm.present();
		}
		else {
			this.verifyCode(this.storeForm.value);		
		}

		this.storeForm.controls['state'].disable();
		this.storeForm.controls['zip'].disable();
	}

	verifyCode(data) {

    if (data['ref'] && data['ref'].length) {
      this.storeService.verifyRef(data['ref']).subscribe((res) => {
        if(res && res.success) {
          data.refBy = res.refBy;
          data.isRef = true;
          this.navCtrl.push(GmapPage, (data));
        }
        else {
          this.alertRefError();
        }
      }, (err)=>{
        this.alertRefError();
      })
    }
    else {
      this.navCtrl.push(GmapPage, (data));
    }
  }

  alertRefError() {
    let confirm = this.alertCtrl.create({
      title:"Validation error!",
      subTitle: 'Invalid referral code.',
      buttons: ['OK']
    });
    confirm.present();
  }

	/*
	getStateNames() {
		this.commonService.getKeywords().subscribe(
			data => {
				this.states = data[0].states;
			},
			error => {
			});
		};*/
	}

	@Component({
		template: `
		<ion-header>
		<ion-toolbar>
		<ion-title>
		Contact Numbers
		</ion-title>
		<ion-buttons start>
		<button ion-button (click)="dismiss()">
		<span ion-text>Close</span>
		</button>
		</ion-buttons>
		</ion-toolbar>
		</ion-header>

		<ion-content>
		<ion-list>
		<ion-item *ngFor="let item of items" style="height:30px; margin-bottom: 4px; background:transparent; font-size:2rem;">
		<span item-start>{{item}}</span>
		<button item-end style="background-color:transparent; color:#ff6666;" (click)="remove(item)">
		<ion-icon name="remove-circle" style="font-size: 35px;"></ion-icon>
		</button>
		</ion-item>		
		<ion-item style="height:35px; background:transparent; font-size:2rem;">
		<input id="contactInput" type="tel" style="height:42px; width: 100%; padding:0; background:rgba(96, 32, 32, 0.1); font-size:1.7rem;" class="brandInput" [(ngModel)]=mobile>
		<button ion-button large item-right style="background:rgb(255, 102, 102);" (click)="addItem()">Add</button>
		</ion-item>
		</ion-list>	
		<button ion-button block item-right style="background:rgb(96, 32, 32); margin:auto; font-size:1.7rem; width:15rem; margin-top:40px;" (click)="close()">Save</button>	
		</ion-content>

		<ion-footer>
		<ion-toolbar>
		<div style="text-align: center; ">
		<ion-buttons>
		<button ion-button block (click)="dismiss()">
		<span>Cancel</span>
		</button>
		</ion-buttons> 
		</div>
		</ion-toolbar>
		</ion-footer>
		`
	})

	export class AddContactModel {
		items = [];
		mobile = '';

		constructor(public viewCtrl: ViewController,
			public navParams: NavParams,
			public alertCtrl: AlertController,
			) {

		}

		ionViewDidEnter() {
			this.items = this.navParams.data.items;
		}

		close() {
			this.viewCtrl.dismiss(this.items);
		}

		dismiss() {
			this.viewCtrl.dismiss(null);
		}

		remove(num) {
			for (var i = this.items.length - 1; i >= 0; i--) {
				if (this.items[i] === num) {
					this.items.splice(i, 1);
					break;
				}
			}
		}

		addItem() {
			let mob = this.mobile.toString();
			if (/^\d{10}$/.test(mob)) {
				this.items.push(mob)
				this.mobile = ''
			}
			else {
				let confirm = this.alertCtrl.create({
					subTitle: 'Please enter a valid mobile number',
					buttons: ['OK']
				});
				confirm.present();
			}
		}
	}