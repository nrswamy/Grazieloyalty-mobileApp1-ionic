import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { CartPage } from '../cart/cart'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LocalstorageProvider } from '../../providers/localstorage/localstorage'
import { StoreService } from '../../providers/store.service';
import { BillingPage } from '../billing/billing'
import { AlertController } from 'ionic-angular';

@Component({
	selector: 'page-cartbilling',
	templateUrl: 'cartbilling.html',
})
export class CartbillingPage {

	storedata: any;
	storeItems = [];
	cartItems = [];
	cartForm: FormGroup;
	itemExists = false;
	editItem = false;
	editIndex = 0;
	itemn = '';
	items:any = [];
	validString = false;
	query = '';
  waitforscan = false;
  scanEle = null;

	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		private storeService: StoreService,
		private fb: FormBuilder,
    private lp: LocalstorageProvider,
		public alertCtrl: AlertController) {
		this.storedata = this.navParams.data;

		this.cartForm = fb.group({
			// We can set default values by passing in the corresponding value or leave blank if we wish to not set the value. For our example, we’ll default the gender to female.
			itemName: new FormControl(null),
			orgPrice: new FormControl(null),
      barCode: new FormControl(null),
			quantity: new FormControl(null),
			includesTax: new FormControl(true),
			GST: new FormControl(null),
			finalPrice: new FormControl({disabled: true}),
      discount: new FormControl(null)
		});

		this.storeService.getItems(this.storedata._id).subscribe((data) => {
			this.storeItems = data.items;
		})

    this.cartForm.patchValue({ 'includesTax': true, 'disc': 0, 'barCode': null })
		this.taxIncludedFlip();
	}

  ionViewWillEnter() {
    this.lp.pages[2].visible = true;
    this.lp.pages[3].visible = true;
    this.lp.pages[6].visible = true;
  }

  ionViewWillLeave() {
    this.lp.pages[2].visible = false;
    this.lp.pages[3].visible = false;
    this.lp.pages[6].visible = false;
  }

	initializeItems() {
		this.items = this.storeItems;
	}

	selectItem(item) {
		this.validString = false;
		this.itemExists = true;
		this.cartForm.reset()
    this.cartForm.patchValue({
      'itemName': item.itemName, 'orgPrice': item.orgPrice, 'discount': item.discount, 'barCode': item.barCode,
      'includesTax': item.includesTax, 'GST': item.GST, 'quantity': 1
    })
		this.itemn = item.itemName
		this.taxIncludedFlip();
		this.onChange();
	}

	queryblur() {
		this.validString = false;
	}

	newItem(query) {
		this.validString = false;
		this.cartForm.reset()
		this.cartForm.patchValue({ 'itemName': query });
		this.itemn = query
		this.itemExists = false;
	}

	getItems(ev: any) {
		// Reset items back to all of the items
		this.initializeItems();

		// set val to the value of the searchbar
		let val = ev.target.value;
		this.validString = false;
		this.query = val;

		// if the value is an empty string don't filter the items
		if (val && val.trim() != '') {
			this.validString = true;
			this.items = this.items.filter((item: any) => {
				return (item.itemName.toLowerCase().indexOf(val.toLowerCase()) > -1);
			})
		}
	}

  getItemBars(ev: any) {

    if (this.waitforscan) {
      this.scanEle = ev
      return;
    }
    this.waitforscan = true;
    this.scanEle = ev
    setTimeout(() => {
      this.waitforscan = false;
      // Reset items back to all of the items
      this.initializeItems();

      // set val to the value of the searchbar
      let val = this.scanEle.target.value;
      this.validString = false;

      // if the value is an empty string don't filter the items
      if (val && val.trim() != '') {
        console.log(this.items)
        this.validString = true;
        let temp = []
        for (var i = 0; i < this.items.length; i++) {
          if (this.items[i].barCode && this.items[i].barCode.length) {
            temp.push(this.items[i])
          }
        }
        this.items = temp;
        if (this.items.length > 0) {
          this.items = this.items.filter((item: any) => {
            return (item.barCode.toLowerCase().indexOf(val.toLowerCase()) > -1);
          })
        }
        console.log(this.items)
      }
    }, 300)
  }

	taxIncludedFlip() {
		this.onChange()
	}

	onChange() {
		let final = this.cartForm.value['orgPrice'];
		let tax = Number(this.cartForm.value['GST']);
    let disc = Number(this.cartForm.value['discount']);
		let quantity = Number(this.cartForm.value['quantity']);

    if (!quantity) {
      return
    }

    final = final - disc;
		if (!this.cartForm.value['includesTax'] && tax) {			
			final = final * ((100.0 + tax) / 100.0);
		}
		final = final * quantity;
		this.cartForm.patchValue({ 'finalPrice': Number(parseFloat(final).toFixed(2)) })
    setTimeout(() => {
      this.validateInputs()
    }, 1000)
	}

	validateInputs() {
		if (this.cartForm.value['GST'] > 100) {
			let tax = Number(this.cartForm.value['GST']);
			tax = Math.floor(tax/10)
			this.cartForm.patchValue({ 'GST': tax })
			let alert = this.alertCtrl.create({
				title: 'Validation Error',
				subTitle: 'Tax cannot be grater than 100%',
				buttons: ['OK']
			});
			alert.present();
		}

    if (this.cartForm.value['discount'] > this.cartForm.value['finalPrice']) {
      console.log(this.cartForm.value['discount'])
      console.log(this.cartForm.value['finalPrice'])

      let alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: 'Discount cannot be grater than Price',
        buttons: ['OK']
      });
      alert.present();
    }
	}

	addItem() {

		if (!this.cartForm.value['itemName']) {
			return;
		}

		if (!this.cartForm.value['orgPrice']) {
			let alert = this.alertCtrl.create({
				title: 'Error',
				subTitle: 'Please enter &#039Price per Unit&#039',
				buttons: ['OK']
			});
			alert.present();
			return;
		}

    if (this.cartForm.value['quantity'] <= 0) {
      let alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: 'Please enter valid &#039Quantity&#039',
        buttons: ['OK']
      });
      alert.present();
      return;
    }

    if (!this.cartForm.value['includesTax']) {

      if (this.cartForm.value['GST'] <= 0) {
        let alert = this.alertCtrl.create({
          title: 'Error',
          subTitle: 'Please enter valid &#039Tax&#039',
          buttons: ['OK']
        });
        alert.present();
        return;
      }
    }
		
		if(this.editItem) {
			this.cartItems.splice(this.editIndex, 1);
		}
		this.editItem = false;
		this.cartItems.push(this.cartForm.value)
		this.cartForm.reset()
		this.cartForm.patchValue({ 'includesTax': true })
		this.taxIncludedFlip();
	}

  fillOld(item, index) {
    this.cartForm.patchValue({
      'itemName': item.itemName, 'orgPrice': item.orgPrice, 'discount': item.discount, 'barCode': item.barCode,
      'includesTax': item.includesTax, 'GST': item.GST, 'quantity': item.quantity, 'finalPrice': item.finalPrice
    })
    this.editItem = true;
    this.editIndex = index;
  }

	removeItem(index: number) {
		this.cartItems.splice(index, 1);
	}

	finalizeBill() {
		let finalBill = 0;
		let len = this.cartItems.length;
		for (let i = 0; i < len;i++) {
			finalBill = finalBill + this.cartItems[i].finalPrice;
		}
		var info = {
			cartBilling: true,
			storeInfo: this.storedata,
			cartItems: this.cartItems,
			finalBill: finalBill,
			parent: this
		}
		this.navCtrl.push(BillingPage, info)
	}

	cleanItems() {
		this.cartItems = [];
	}

}
