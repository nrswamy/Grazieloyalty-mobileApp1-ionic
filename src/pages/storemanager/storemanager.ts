import { Component } from '@angular/core';
import { NavController, NavParams, MenuController, LoadingController } from 'ionic-angular';
import { RetailerService } from '../../providers/index';
import { CommonService, StoreService } from '../../providers/index';
import { LocalstorageProvider } from '../../providers/localstorage/localstorage';
import { StoreComponent } from '../store/store';
import { StoreRegisterComponent } from '../storeregister/storeregister'
/**
* Generated class for the StoremanagerComponent component.
*
* See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
* for more info on Angular Components.
*/
@Component({
	selector: 'storemanager',
	templateUrl: 'storemanager.html'
})
export class StoremanagerComponent {

	stores: any;
	profile: null;

	constructor(private retailerService: RetailerService,
		private cs: CommonService,
		private localStorage: LocalstorageProvider,
		private storeService:StoreService,
		public loadingCtrl: LoadingController,
		private menu: MenuController,
		public navCtrl: NavController,
		public navParams: NavParams) {
		this.getStores();
	}

	ionViewDidEnter() {
		this.localStorage.isRootPage = true;
	}

	doRefresh(refresher) {
		this.getStores();
		setTimeout(() => {
			refresher.complete();
		}, 1000);
	}

	getStores() {
		let loading = this.loadingCtrl.create({
			content: 'Please wait...',
			duration: 6000
		});

		loading.present();
		this.retailerService.getStores().subscribe(
			data => {
				this.stores = data;
				this.localStorage.setItem('storedata', JSON.stringify(this.stores));
				for (let index = 0; index < data.length; index++) {
					this.cs.getImageThumbUrl(index, this.stores[index].profileImageUrl).then((data) => {
						if (data.success) {
							this.stores[index].profilePic = data.url;
						}
						else {
							this.stores[index].profilePic = '';
						}
					})
				}
				loading.dismiss();
			},
			error => {
				loading.dismiss();
			});
		this.retailerService.getStatData().subscribe(
			data => {
				this.localStorage.setItem('statsdata', data.stats);
			},
			error => {
				console.log(error)
			})
	};

	openstore(storedata: any) {
 		//console.log(storedata.name)
     this.localStorage.isRootPage = false; 
     this.localStorage.setItem('currentStore', storedata)
     this.navCtrl.setRoot(StoreComponent, storedata);
   }

   addStore() {
     this.navCtrl.push(StoreRegisterComponent);
   }

   ionViewWillEnter() {
     this.localStorage.isRootPage = true;
   }

  ionViewWillLeave() {
    this.localStorage.isRootPage = false;
  }


 }
