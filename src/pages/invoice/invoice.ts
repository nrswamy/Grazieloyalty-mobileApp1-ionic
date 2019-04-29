import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, ToastController, LoadingController, ViewController, PopoverController, NavParams, Platform, Content } from 'ionic-angular';
import { LocalstorageProvider } from '../../providers/localstorage/localstorage'
import { Printer, PrintOptions } from '@ionic-native/printer';
import { File } from '@ionic-native/file';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { FileOpener } from '@ionic-native/file-opener';

declare var cordova;

@Component({
  selector: 'page-invoice',
  templateUrl: 'invoice.html',
})
export class InvoicePage {

  @ViewChild(Content) content: Content;

  details: any = {};
  store = null;
  total = 0;
  visible = true;
  popover = null;
  taxslab = [];
  taxamt = [];
  taxtot = [];
  printerarg = [];
  loader = null;
  printerAvailable = false;
  selectedPrinter: any = null;
  monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  paperString = "A4 (297mm)"

  constructor(public navCtrl: NavController,
    private localStorage: LocalstorageProvider,
    public printer: Printer,
    public platform: Platform,
    private file: File,
    public alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private localNotifications: LocalNotifications,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private fileOpener: FileOpener,
    private popoverCtrl: PopoverController,
    public navParams: NavParams) {

    this.details = this.navParams.data;
    this.localStorage.getItem('currentStore').then((data) => {
      this.store = data;
    }).catch((err) => {
      console.log(err)
    })

    this.localNotifications.on('click').subscribe(data=>{
      if (data && data.data && data.data.secret) {
        this.fileOpener.open(data.data.secret, 'application/pdf')
        .then(() => console.log('File is opened'))
        .catch(e => console.log('Error opening file', e));
      }

    })

    let time = new Date(this.details.createdAt)
    this.details['day'] = '' + time.getDate() + ' ' + this.monthNames[time.getMonth()] + ', ' + time.getFullYear();
    this.details['time'] = '' + time.getHours() + '-' + time.getMinutes()

    if (this.details.cartItems && this.details.cartItems.length) {

      this.details.cartItems = this.sortByKey(this.details.cartItems, 'GST');

      for (var i = this.details.cartItems.length - 1; i >= 0; i--) {
        var tax = 0;

        if (!this.details.cartItems[i].includesTax && this.details.cartItems[i].GST > 0) {
          let prc = Number(this.details.cartItems[i].orgPrice - this.details.cartItems[i].discount)
          this.details.cartItems[i].orgPrice = Number(prc.toFixed(2))
        }
        if (!this.details.cartItems[i].includesTax) {
          tax = Number(this.details.cartItems[i].orgPrice * this.details.cartItems[i].quantity * Number(this.details.cartItems[i].GST / 100))
        }
        else {
          tax = Number(this.details.cartItems[i].orgPrice * 100 / (100 + this.details.cartItems[i].GST))
          this.details.cartItems[i]['orgPrice'] = Number(this.details.cartItems[i].finalPrice * (100 - this.details.cartItems[i].GST) / (this.details.cartItems[i].quantity * 100))
        }

        var len = this.taxslab.length;
        for (var ind = 0; ind <= len; ind++) {
          if (ind == len) {
            this.taxslab.push(this.details.cartItems[i]['GST'])
            this.taxamt.push(0.0)
            this.taxtot.push(0.0)
            this.taxamt[ind] = this.taxamt[ind] + Number(tax.toFixed(2));
            let tot = this.details.cartItems[i].orgPrice * this.details.cartItems[i].quantity
            this.taxtot[ind] = this.taxtot[ind] + Number(tot.toFixed(2));
          }
          else if (this.taxslab[ind] == this.details.cartItems[i]['GST']) {
            this.taxamt[ind] = this.taxamt[ind] + Number(tax.toFixed(2));
            let tot = this.details.cartItems[i].orgPrice * this.details.cartItems[i].quantity
            this.taxtot[ind] = this.taxtot[ind] + Number(tot.toFixed(2));
          }
        }

      }
    }
  }

  sortByKey(array, key) {
    return array.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }

  close() {
    this.navCtrl.pop()
  }

  print() {
    const div = document.getElementById("Html2Pdf");

    this.loader = this.loadingCtrl.create({
      content: 'Creating PDF...',
      duration: 6000
    });
    this.loader.present()

    var me = this;

    var fileName = 'GZETXN_' + this.details._id + '.pdf';
    let options = {
      documentSize: 'A4',
      type: 'base64'
    }

    cordova.plugins.pdf.fromData(div.innerHTML, options)
    .then((base64) => {
      var contentType = "application/pdf";

        // if cordova.file is not available use instead :
        // var folderpath = "file:///storage/emulated/0/Download/";
        var folderpath = cordova.file.externalRootDirectory + "Download/"; //you can select other folders
        this.savebase64AsPDF(folderpath, fileName, base64, contentType);
      })   // returns base64:JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PC9DcmVh...
    .catch((err) => { console.log(err); me.loader.dismiss(); me.handleWriteErr(); })
  }

  b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  savebase64AsPDF(folderpath, filename, content, contentType) {

    var me = this;
    // Convert the base64 string in a Blob
    var DataBlob = this.b64toBlob(content, contentType, 512);

    console.log("Starting to write the file :3");

    var fname = folderpath + filename;

    this.file.resolveDirectoryUrl(folderpath).then(dir=>{
      dir.getFile(filename, { create: true, exclusive:false }, function(file) {
        file.createWriter(function(fileWriter) {
          fileWriter.onwriteend = function(e) {
            console.log("Starting to write end");
            me.loader.dismiss()
          };

          fileWriter.onerror = function(e) {
            me.loader.dismiss()
            me.handleWriteErr();
          };

          fileWriter.onabort = function(e) {
            me.loader.dismiss()
            me.handleWriteErr();
          };

          fileWriter.onwrite = function(e) {
            console.log("Starting to write success");
            let toast = me.toastCtrl.create({
              message: 'Receipt successfully downloaded',
              duration: 3000,
              position: 'top'
            });
            toast.present();

            me.localNotifications.requestPermission().then(
              (permission) => {
                if (permission) {

                  // Create the notification
                  me.localNotifications.schedule({
                    id: 1542,
                    title: 'GrazieLoyalty',
                    text: 'Download complete!',
                    data: { secret: fname }
                  });

                }
              }
              );

            me.fileOpener.open(fname, 'application/pdf')
            .then(() => console.log('File is opened'))
            .catch(e => console.log('Error opening file', e));
          };
          console.log("Starting to write");
          fileWriter.write(DataBlob);

        }, function() {
          me.loader.dismiss()
          me.handleWriteErr();
        });
      }, () => { console.log('Error getting file'); me.loader.dismiss(); me.handleWriteErr(); });
    }, err=>{
      console.log(err); me.loader.dismiss(); me.handleWriteErr();
    })
  }

  handleWriteErr() {
    let confirm = this.alertCtrl.create({
      subTitle: 'Failed to create pdf file.',
      buttons: ['OK']
    });
    confirm.present();
  }


}


@Component({
  template: `
  <ion-header>

  <ion-navbar>
  <ion-title>Printer List</ion-title>
  </ion-navbar>

  </ion-header>


  <ion-content>
  <ion-list>
  <ion-item *ngFor="let item of printerList" (tap)="select(item)">
  {{item.name}} {{item.id}}
  </ion-item>
  </ion-list>
  </ion-content>
  `
})

export class PrinterSelector {

  printerList: any = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    this.printerList = this.navParams.get('data');

  }

  select(data) {
    this.viewCtrl.dismiss(data);
  }
}
