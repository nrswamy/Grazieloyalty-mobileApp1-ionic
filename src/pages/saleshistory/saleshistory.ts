import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { StoreService } from '../../providers/index';
import { LocalstorageProvider } from '../../providers/localstorage/localstorage'

@Component({
  selector: 'page-saleshistory',
  templateUrl: 'saleshistory.html',
})
export class SaleshistoryPage {

  history = [];
  storeId = null;
  transPur = 'purchase';
  transSet = 'settle';

  constructor(public navCtrl: NavController, 
    private stores:StoreService,
    private localStorage: LocalstorageProvider,
    public viewCtrl: ViewController,
    private modalCtrl: ModalController,
    public navParams: NavParams) {

    this.localStorage.getItem('currentStore').then((data) => {
      let res = data;
      this.stores.getRecentSales(res._id).then((data) => {
        if (data && data.success) {
          this.history = data.result;          
        }
      }, (err) => {
        console.log(err)
      })
    }).catch((err)=>{
      console.log(err)
    })    
  } 

  showModal(transaction) {
    let detailModal = this.modalCtrl.create(SaleDetailPage, transaction, {
      cssClass: 'payment-list'
    });

    detailModal.present();
  }

  close() {
    this.viewCtrl.dismiss();
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
  Sale Details
  </ion-title>
  </ion-toolbar>
  </ion-header>

  <ion-content>
  <ion-list>
  <ion-item>
  <ion-label>Customer Mobile : {{details.userMobile}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Bill Amount : {{details.billValue}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Deducted previous balance : {{details.deductedBalance}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Deducted rewards : {{details.deductedRewards}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Discount given(Rs) : {{details.discount}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Cashback given(Pts) : {{details.reward}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Final Bill : {{details.finalBill}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Amount Paid : {{details.amountPaid}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Billing Type : {{details.billType}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Transaction Type : {{details.transactionType}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Bill Date : {{details.ddmmyyyy}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Status : {{details.status}}</ion-label>
  </ion-item>
  <ion-item>
  <span>Transaction Id : </span><p>{{details._id}}</p>
  </ion-item>
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
  </ion-list>
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

export class SaleDetailPage {
  details: any = {};

  constructor(public viewCtrl: ViewController,
    public navParams: NavParams
    ) {
    this.details = this.navParams.data;
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
