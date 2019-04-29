import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { RetailerService } from '../../providers/index'

@Component({
  selector: 'page-paymenthistory',
  templateUrl: 'paymenthistory.html',
})
export class PaymenthistoryPage {

  payentDetails = [];
  successres = "Success"
  failureres = "Failed"
  unknownres = "Pending"
  monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];


  constructor(public navCtrl: NavController, 
    private rs: RetailerService,
    public viewCtrl: ViewController,
    private modalCtrl: ModalController,
    public navParams: NavParams) {
  }

  ionViewWillEnter() {
    this.rs.getPayments().then((data)=>{
      if(data && data.success) {
        this.payentDetails = data.result;
        for (var i = this.payentDetails.length - 1; i >= 0; i--) {
          if(this.payentDetails[i].status == 'Credit') {
            this.payentDetails[i].status = 'Success'
          }
          let d = new Date(this.payentDetails[i].updatedAt)
          var curr_date = d.getDate();
          var curr_month = d.getMonth();
          var curr_year = d.getFullYear();
          this.payentDetails[i].date = curr_date + " " + this.monthNames[curr_month] + ", " + curr_year;
        }
      }
    }, (err)=>{
      console.log(err)
    })
  }

  showModal(payment) {
    let detailModal = this.modalCtrl.create(PaymentPage, payment, {
      cssClass: 'payment-list'
    });

    detailModal.present();
  }

  close() {
    this.viewCtrl.dismiss()
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
  Payment Details
  </ion-title>
  </ion-toolbar>
  </ion-header>

  <ion-content>
  <ion-list>
  <ion-item>
  <ion-label>Amount : {{details.amount}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Date : {{details.date}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Email : {{details.email}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Mobile : {{details.userMobile}}</ion-label>
  </ion-item>
  <ion-item text-wrap>
  <span>Payment Id : </span> <p>{{details.payment_request_id}}</p>
  </ion-item>
  <ion-item text-wrap>
  <span>Payment link : </span> <p>{{details.longurl}}</p>
  </ion-item>
  <ion-item>
  <ion-label>Purpose : {{details.purpose}}</ion-label>
  </ion-item>
  <ion-item>
  <ion-label>Status : {{details.status}}</ion-label>
  </ion-item>
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

export class PaymentPage {
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