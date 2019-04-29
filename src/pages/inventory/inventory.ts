import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { CartPage } from '../cart/cart'
import { StoreService } from '../../providers/store.service'


@Component({
	template: `
	<ion-list>
	<button ion-item (click)="close('Name')">Name</button>
	<button ion-item (click)="close('Added first')">Added first</button>
	<button ion-item (click)="close('Added last')">Added last</button>
	</ion-list>
	`
})

export class PopoverPage {
	constructor(public viewCtrl: ViewController) { }

	close(str: string) {
		this.viewCtrl.dismiss(str);
	}
}

@Component({
	selector: 'page-inventory',
	templateUrl: 'inventory.html',
})
export class InventoryPage {

	storedata: any;
	sortByString = 'Name';
	items = [];

	constructor(public navCtrl: NavController, public navParams: NavParams,
		public popoverCtrl: PopoverController,
		private storeService: StoreService) {

		this.storedata = this.navParams.data;
		this.storeService.getItems(this.storedata._id).subscribe((data) => {
			this.items = data.items;
			this.sortByName();
		})
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad InventoryPage');
	}

	addItems(myEvent) {
		var info = {
			'edit': false,
			'storeId': this.storedata._id
		}
		this.storedata.edit = false;
    let popover = this.popoverCtrl.create(CartPage, info, { cssClass: 'custom-popover-full' });
		popover.onDidDismiss(() => {
			this.storeService.getItems(this.storedata._id).subscribe((data) => {
				this.items = data.items;
				if (this.sortByString == 'Added last') {
					this.sortByDateNew()
				}
				else if (this.sortByString == 'Added first') {
					this.sortByDateOld()
				}
				else {
					this.sortByName()
				}
			})
		});
		popover.present({
			ev: myEvent
		});
	}

	presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(PopoverPage, {}, { cssClass: 'custom-popover' });
		popover.onDidDismiss(data => {			
			if (data == 'Added last') {
        this.sortByString = data;
				this.sortByDateNew()
			}
			else if (data == 'Added first') {
        this.sortByString = data;
				this.sortByDateOld()
			}
      else if (data == 'Name') {
        this.sortByString = data;
				this.sortByName()
			}
		});
		popover.present({
			ev: myEvent
		});
	}

	removeItem(item) {
		this.storeService.removeItem(item).subscribe((data) => {
			console.log(data)
		})
	}

	editItem(myEvent, item:any) {
		var itemInfo = item;
		itemInfo.edit = true;
		itemInfo.storeId = this.storedata._id;

    let popover = this.popoverCtrl.create(CartPage, itemInfo, { cssClass: 'custom-popover-full' });
		popover.onDidDismiss(() => {
			this.storeService.getItems(this.storedata._id).subscribe((data) => {
				this.items = data.items;
				if (this.sortByString == 'Added last') {
					this.sortByDateNew()
				}
				else if (this.sortByString == 'Added first') {
					this.sortByDateOld()
				}
				else {
					this.sortByName()
				}
			})
		});
		popover.present({
			ev: myEvent
		});
	}

	sortByName() {
		this.items.sort(function(name1, name2) {
			if (name1.itemName < name2.itemName) {
				return -1;
			} else if (name1.itemName > name2.itemName) {
				return 1;
			} else {
				return 0;
			}
		});
	}

	sortByDateOld() {
		this.items.sort(function(name1, name2) {
			let date1 = new Date(name1.createdAt)
			let date2 = new Date(name2.createdAt)
			if (date1 < date2) {
				return -1;
			} else if (date1 > date2) {
				return 1;
			} else {
				return 0;
			}
		});
	}

	sortByDateNew() {
		this.items.sort(function(name1, name2) {
			let date1 = new Date(name1.createdAt)
			let date2 = new Date(name2.createdAt)
			if (date1 < date2) {
				return 1;
			} else if (date1 > date2) {
				return -1;
			} else {
				return 0;
			}
		});
	}

}
