import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@Component({
  selector: 'page-qr-scan',
  templateUrl: 'qr-scan.html',
})
export class QrScanPage {

  constructor(public viewCtrl: ViewController,
    private barcodeScanner: BarcodeScanner, 
    public navParams: NavParams) {

    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      this.viewCtrl.dismiss(barcodeData)
    }).catch(err => {
      console.log('Error', err);
      this.viewCtrl.dismiss(null)
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QrScanPage');
  }

}
