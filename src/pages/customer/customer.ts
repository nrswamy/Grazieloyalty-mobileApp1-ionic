import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ViewController, ModalController } from 'ionic-angular';
import { RetailerService } from '../../providers/index'
import { DatePipe } from '@angular/common';

@Component({
  selector: 'page-customer',
  templateUrl: 'customer.html',
})
export class CustomerPage {

  mobile: string;
  items:any = []

  constructor(public navCtrl: NavController,
    private retailers: RetailerService,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    private modalCtrl: ModalController,
    private datePipe: DatePipe,
    public navParams: NavParams) {
  }

  search() {
    if (/^\d{10}$/.test(this.mobile)) {
      let data = {
        mobile: this.mobile
      }
      this.items = {};
      this.retailers.customerHistory(data).then((data) => {
        if(data && data.success) {
          this.items = data.info;
          for (var i = this.items.length - 1; i >= 0; i--) {
            let dd = this.items[i].createdAt;
            this.items[i]['date'] = this.datePipe.transform(dd, 'dd-MM-yyyy');
          }
        }
      }, (err) => {
        console.log(err)
      })
    }
    else if(this.mobile.length == 10){
      let confirm = this.alertCtrl.create({
        subTitle: 'Please enter a valid mobile number',
        buttons: ['OK']
      });
      confirm.present();
    }    
  }

  dismiss() {
    this.viewCtrl.dismiss()
  }

  showModal(trans) {
    let detailModal = this.modalCtrl.create(TransactionPage, trans, {
      cssClass: 'payment-list'
    });

    detailModal.present();
  }

}

@Component({
  template: `
  <ion-header>
  <ion-toolbar>
  <ion-buttons left>
  <button ion-button icon-only (click)="close()">
  <ion-icon name="arrow-back"></ion-icon>
  </button>
  </ion-buttons>
  <ion-title>
  Transaction Details
  </ion-title>
  </ion-toolbar>
  </ion-header>

  <ion-content>
  <ng-container *ngIf="details">
  <ion-list>
  <ion-item>
  <ion-label>Store : {{details.storeId.name}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Date : {{details.createdAt}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Customer Mobile : {{details.userMobile}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Transaction Type : {{details.transactionType}}</ion-label>
  </ion-item>
  </ion-list>
  <ion-list *ngIf="details.billType == 'cart'">
  CART:
  <ion-item>
  <ion-row>
  <ion-col col-3 class="item-col">
  <span>Item</span>
  </ion-col>
  <ion-col col-3 class="item-col">
  <span>Qty</span>
  </ion-col>
  <ion-col col-3 class="item-col">
  <span>Tax(%)</span>
  </ion-col>
  <ion-col col-3 class="item-col">
  <span>Price</span>
  </ion-col>
  </ion-row>
  <ion-row>
  <ion-col col-3 class="item-col">
  <span>Discount</span>
  </ion-col>
  <ion-col col-3 class="item-col">
  <span></span>
  </ion-col>
  <ion-col col-3 class="item-col">
  <span></span>
  </ion-col>
  <ion-col col-3 class="item-col">
  <span>Value</span>
  </ion-col>
  </ion-row>
  </ion-item>
  <ion-item *ngFor="let item of details.cartItems">
  <ion-row>
  <ion-col col-3 class="item-col">
  <span>{{item.itemName}}</span>
  </ion-col>
  <ion-col col-3 class="item-col">
  <span>{{item.quantity}}</span>
  </ion-col>
  <ion-col col-3 class="item-col">
  <span>{{item.GST}}</span>
  </ion-col>
  <ion-col col-3 class="item-col">
  <span>{{item.orgPrice}}</span>
  </ion-col>
  </ion-row>
  <ion-row>
  <ion-col col-3 class="item-col">
  <span *ngIf="item.disc>0">Disc(%): {{item.disc}}</span>
  </ion-col>
  <ion-col col-3 class="item-col">
  <span></span>
  </ion-col>
  <ion-col col-3 class="item-col">
  <span></span>
  </ion-col>
  <ion-col col-3 class="item-col">
  <span>{{item.finalPrice}}</span>
  </ion-col>
  </ion-row>
  </ion-item>
  </ion-list>
  <ion-list>
  <ion-item>
  <ion-label>Deducted Balance(Rs) : {{details.deductedBalance}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Deducted Rewards(Rs) : {{details.deductedRewards}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Overall discount(Rs) : {{details.discount}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Rewards Awarded(Rs) : {{details.reward}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Total Tax(Rs) : {{details.tax}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Final Price(Rs) : {{details.finalBill}}</ion-label>
  </ion-item>
  </ion-list>
  </ng-container>
  </ion-content>

  <ion-footer>
  <ion-toolbar>
  <div style="text-align: center; ">
  <ion-buttons>
  <button ion-button block (click)="close()">
  <span>Close</span>
  </button>
  </ion-buttons> 
  </div>
  </ion-toolbar>
  </ion-footer>
  `
})

export class TransactionPage {
  details: any = null;

  constructor(public viewCtrl: ViewController,
    private retailers: RetailerService,
    private datePipe: DatePipe,
    public navParams: NavParams
    ) {
  }

  ionViewDidEnter() {
    this.retailers.getTrans(this.navParams.data._id).then((response)=>{
      if(response && response.success) {
        this.details = response.result;
        let dd = this.details.createdAt;
        this.details.createdAt = this.datePipe.transform(dd, 'dd-MM-yyyy');
        console.log(this.details)
      }
    },(err)=>{
      console.log(err)
    })
  }

  close() {
    this.viewCtrl.dismiss();
  }
}