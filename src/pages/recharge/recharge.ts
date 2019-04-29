import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController, PopoverController } from 'ionic-angular';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser';
import { RetailerService, CommonService } from '../../providers/index'
import { SocketioProvider } from '../../providers/socketio/socketio'
import * as myVars from '../../config';

@Component({
  selector: 'page-recharge',
  templateUrl: 'recharge.html',
})
export class RechargePage {

  packDetails:any = null;
  topUps: any = null;
  viewType: string = "packages";
  viewTopup = false;
  user: any = {};

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private retailers: RetailerService,
    public viewCtrl: ViewController,
    public popoverCtrl: PopoverController,
    private iab: InAppBrowser,
    private io: SocketioProvider,
    private cs: CommonService) {

    this.user = this.navParams.data;

    this.cs.getPackDetails().then((data)=>{
      if(data.success) {
        this.packDetails = data.packs;
        for (var i = this.packDetails.length - 1; i >= 0; i--) {

          this.packDetails[i].showDetails = false;
          if (this.packDetails[i].offerExist) {
            let endDate = new Date(this.packDetails[i].endDate);
            endDate.setHours(23, 59, 59, 999);

            let startDate = new Date(this.packDetails[i].startDate);
            let date = new Date();
            if (date > endDate || date < startDate) {
              this.packDetails[i].offerExist = false;
              this.packDetails[i].newPrice = this.packDetails[i].packPrice;
              continue;
            }
            this.packDetails[i].newPrice = Math.floor(((100 - this.packDetails[i].percent) * this.packDetails[i].packPrice)/100)
          }
          else {
            this.packDetails[i].newPrice = this.packDetails[i].packPrice;
          }
        }
      }
    },(err)=>{
      console.log(err)
    })

    this.cs.getTopups().then((topups) => {
      if (topups.success) {
        this.topUps = topups.packs;
        for (var i = this.topUps.length - 1; i >= 0; i--) {
          if(this.topUps[i].isTax) {
            this.topUps[i].final = this.roundTo((this.topUps[i].value * (100 + this.topUps[i].tax) / 100), 2)
          }
          else {
            this.topUps[i].final = this.topUps[i].value;
          }
        }
      }
    }, (err) => {
      console.log(err)
    })
  }

  roundTo(n, digits) {
    var negative = false;
    if (digits === undefined) {
      digits = 0;
    }
    if (n < 0) {
      negative = true;
      n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(2);
    if (negative) {
      n = (n * -1).toFixed(2);
    }
    return n;
  }

  close() {
    this.viewCtrl.dismiss();
  }

  loadPackages() {
    this.viewTopup = false;
  }

  loadTopups() {
    this.viewTopup = true;
  }

  openPay(plan) {
    let data = {
      amount: plan.newPrice,
      days: plan.value,
      offer: plan.percent,
      reqType: plan.reqType,
      packName: plan.packName,
      mobile: this.user.mobile_no,
      name: this.user.fullname,
      email: this.user.email,
      webhook: myVars.BASE_API_URL + '/retailers/pmwh',
      send_email: true,
      sid: this.io.getId(),
      did: this.user.uuid,
      points: plan.points
    }

    if (this.user.email == "") {
      data.send_email = false;
    }

    this.retailers.createPaymentUrl(data).then((response) => {
      if (response.success) {
        var browser = this.iab.create(response.urlInfo.payment_request.longurl, '_system', 'location = no');
        this.viewCtrl.dismiss(true);
      }
      else {
        this.handleError()
      }
    }, (err) => {
      console.log(err)
    })

  }

  choosePlan(selected) {
    let popover = this.popoverCtrl.create(BillPlanPopover, {selected}, { cssClass: 'custom-popover', enableBackdropDismiss: true });
    popover.onDidDismiss(plan => {
      if (plan){
        this.openPay(plan)
      }
    });
    popover.present();
  }

  payTopup(top) {
    let msg = '<p><b>TopUp value: </b>' + top.value + '<br><b>Credits to be added: </b>' + top.points + '<br><b>Amount to be Paid: </b>' + top.final + '</p>';
    let confirm = this.alertCtrl.create({
      title: 'Top-Up',
      subTitle: msg,
      buttons: [
      {
        text: 'Cancel',
        handler: data => {
          //console.log('Cancel clicked');
        }
      },
      {
        text: 'Buy',
        handler: data => {
          this.openPay({ newPrice: top.final, value: 0, percent: 0, reqType: 'topup', packName: 'NA', points: top.points });
        }
      }
      ]
    });
    confirm.present();
  }

  handleError() {
    let confirm = this.alertCtrl.create({
      title: 'Error',
      subTitle: 'Sorry, Unable to process your request.  Pleae try again later',
      buttons: ['Ok']
    });
    confirm.present();
  }
}


@Component({
  template: `
  <ion-header>
  <ion-toolbar class="popover-toolbar">
  <ion-title>Choose Plan</ion-title>
  <ion-buttons start>
  <button ion-button (click)="close()">
  <span ion-text>Close</span>
  </button>
  </ion-buttons>
  </ion-toolbar>
  </ion-header>

  <ion-content>
  <ion-list radio-group [(ngModel)]="finalPlan">
  <ng-container>
  <ion-item *ngFor="let payment of payments">
  <ion-radio value="{{payment.value}}" checked item-start></ion-radio>
  <ion-label>{{payment.desc}}</ion-label>
  <span item-end>
  <span class="strike" *ngIf="payment.offerExist">Rs.{{payment.orgPrice}}</span>Rs.{{payment.newPrice}}<br>
  <span *ngIf="payment.offerExist" class="offerspan">{{payment.percent}} + {{payment.extra}}%Off</span>
  </span>
  </ion-item>
  </ng-container>
  </ion-list>

  <ion-item class="itemdetail">
  <button item-center class="paybutton" ion-button (click)="choose()">Purchase</button>
  </ion-item>

  </ion-content>
  `
})

export class BillPlanPopover {

  paymentSelected:any = {};
  payments:any = [];
  finalPlan = 90;
  constructor(public viewCtrl: ViewController,
    private navParams: NavParams) { 


    this.paymentSelected = this.navParams.data.selected;
    var data = {
      desc: '90 days',
      packName: this.paymentSelected.packName,
      orgPrice: Math.floor(this.paymentSelected.packPrice * 3),
      newPrice: Math.floor(this.paymentSelected.newPrice * 3),
      offerExist: this.paymentSelected.offerExist,
      percent: this.paymentSelected.percent,
      extra: 0,
      value: 90,
      reqType: 'validity',
      points: this.paymentSelected.packDetails.free_credits,
    }
    this.payments.push(JSON.parse(JSON.stringify(data)))
    this.payments.push(JSON.parse(JSON.stringify(data)))
    this.payments.push(JSON.parse(JSON.stringify(data)))

    this.payments[1].desc = '180 days'
    this.payments[1].orgPrice = Math.floor(this.paymentSelected.packPrice * 6)
    this.payments[1].newPrice = Math.floor(this.paymentSelected.newPrice * 6 * 0.9)
    this.payments[1].offerExist = true;
    this.payments[1].extra = 10;
    this.payments[1].value = 180;
    

    this.payments[2].desc = '365 days'
    this.payments[2].orgPrice = Math.floor(this.paymentSelected.packPrice * 12)
    this.payments[2].newPrice = Math.floor(this.paymentSelected.newPrice * 12 * 0.75)
    this.payments[2].offerExist = true;
    this.payments[2].extra = 25;
    this.payments[2].value = 365;
  }

  close() {
    this.viewCtrl.dismiss(null);
  }

  choose(payment) {
    if (this.finalPlan == 90) this.viewCtrl.dismiss(this.payments[0]);
    else if (this.finalPlan == 180) this.viewCtrl.dismiss(this.payments[1]);
    else if (this.finalPlan == 365) this.viewCtrl.dismiss(this.payments[2]);
    else this.viewCtrl.dismiss(null);
  }

}