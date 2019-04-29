import { Component } from '@angular/core';
import { NavController, Platform, NavParams, ViewController, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { StoreService } from '../../providers/store.service'


@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html',
})
export class CartPage {

  isLandscape = false;
  cartForm: FormGroup;
  itemInfo: any;
  itemEdit = false;

  constructor(public navCtrl: NavController,
    public platform: Platform,
    private fb: FormBuilder,
    public navParams: NavParams,
    private storeService: StoreService,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController) {

    this.cartForm = fb.group({
      itemName: new FormControl(null),
      orgPrice: new FormControl(null),
      barCode: new FormControl(null),
      includesTax: new FormControl(true),
      GST: new FormControl(null),
      finalPrice: new FormControl(null),
      storeId: new FormControl(null),
      stockLeft: new FormControl(null),
      discount: new FormControl(null)
    });

    this.itemInfo = this.navParams.data;
    this.itemEdit = this.itemInfo.edit;
    this.cartForm.patchValue({ 'storeId': this.itemInfo.storeId, 'includesTax': true, 'barCode': null, 'stockLeft': 0 })
    if (this.itemEdit) {
      this.cartForm.patchValue({
        'itemName': this.itemInfo.itemName,
        'orgPrice': this.itemInfo.orgPrice,
        'includesTax': this.itemInfo.includesTax,
        'GST': this.itemInfo.GST,
        'finalPrice': this.itemInfo.finalPrice,
        'barCode': this.itemInfo.barCode,
        'stockLeft': this.itemInfo.stockLeft
      })

      if (this.itemInfo.discount) {
        this.cartForm.patchValue({ 'discount': this.itemInfo.discount })
      }
      else {
        this.cartForm.patchValue({ 'discount': 0 })
      }
    }
    this.taxIncludedFlip()

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CartPage');
  }

  taxIncludedFlip() {
    this.onChange()
  }

  onChange() {
    let final = this.cartForm.value['orgPrice'];
    let disc = this.cartForm.value['discount'];
    let tax = Number(this.cartForm.value['GST']);

    if (disc > 0) {
      final = final - disc;
    }

    if (!this.cartForm.value['includesTax'] && tax) {
      final = final * ((100.0 + tax) / 100.0);
    }
    this.cartForm.patchValue({ 'finalPrice': Number(parseFloat(final).toFixed(2)) })
  }

  addItem() {
    let loader = this.loadingCtrl.create({
      content: "Processing...",
      duration: 6000
    });
    loader.present();
    this.storeService.addItem(this.cartForm.value).subscribe((data) => {
      loader.dismiss();
      this.viewCtrl.dismiss();
    }, (err) => {
      loader.dismiss();
      this.viewCtrl.dismiss();
    })
  }

  updateItem() {
    var info = this.cartForm.value;
    info.itemId = this.itemInfo._id;
    let loader = this.loadingCtrl.create({
      content: "Updating...",
      duration: 6000
    });
    loader.present();
    this.storeService.updateItem(info).subscribe((data) => {
      loader.dismiss();
      this.viewCtrl.dismiss();
    }, (err) => {
      loader.dismiss();
      this.viewCtrl.dismiss();
    })
  }

  removeItem() {
    var info = {
      'itemId': this.itemInfo._id,
      'storeId': this.itemInfo.storeId
    }
    let loader = this.loadingCtrl.create({
      content: "Updating...",
      duration: 6000
    });
    loader.present();
    this.storeService.removeItem(info).subscribe((data) => {
      loader.dismiss();
      this.viewCtrl.dismiss();
    }, (err) => {
      loader.dismiss();
      this.viewCtrl.dismiss();
    })
  }

}
