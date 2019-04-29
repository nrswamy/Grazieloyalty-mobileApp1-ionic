import { Component } from '@angular/core';
import { ViewController, Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { RetailerService, CommonService } from '../../providers/index'
import { LocalstorageProvider } from '../../providers/localstorage/localstorage'
import { Market } from '@ionic-native/market';
import { ConnectivityProvider } from '../../providers/connectivity/connectivity'
import { Network } from '@ionic-native/network';
import { AlertController } from 'ionic-angular';

const CURRENT_RETAILER_APP_VERSION = 5;

@Component({
  selector: 'page-splash',
  templateUrl: 'splash.html',
})
export class SplashPage {

	div = document.getElementById('main');
  errorOccured = false;
  verifyDone = false;
  networkAlert: any;
  alertPresented = false;
  timeoutneeded = true;

  constructor(public platform: Platform,
    public viewCtrl: ViewController, 
    private retailers: RetailerService, 
    private localStorage: LocalstorageProvider,
    private network: Network,
    public splashScreen: SplashScreen,
    private market: Market,
    private cp: ConnectivityProvider,
    public alertCtrl: AlertController) {

  }

  ionViewDidEnter() {

    this.splashScreen.hide();
    this.retryNetworkCheck();

    var timer = setTimeout(() => {
      this.timeoutneeded = false;
    }, 2000);

  }

  dismissApp() {
    if(this.timeoutneeded) {
      console.log('needed')
      setTimeout(() => {
        this.viewCtrl.dismiss()
      }, 3000);
    }
    else {
      this.viewCtrl.dismiss()
    }
  }

  verify() {

    for (var i = 0; i < 100000; i++) {
      if (this.localStorage.isReady()) {
        break;
      }
    }

    this.verifyDone = true;
    this.retailers.validateApp().then((data) => {
      if (data && data.success) {
        let versionInfo = data;
        let today = new Date().getTime();
        if (versionInfo.minSupportVersion > CURRENT_RETAILER_APP_VERSION) {
          let alert = this.alertCtrl.create({
            title: 'Update Required',
            subTitle: 'This version of the app is not supported. Please update.',
            buttons: [
            {
              text: 'Update',
              handler: () => {
                this.market.open('com.GrazieLoyalty.tech');
              }
            }
            ],
            enableBackdropDismiss: false
          });
          alert.present();
        }
        else if (versionInfo.version > CURRENT_RETAILER_APP_VERSION && today >= versionInfo.updateDate) {
          let alert = this.alertCtrl.create({
            title: 'Update Available',
            subTitle: 'A newer version of this app is available. Please update.',
            buttons: [
            {
              text: 'Later',
              handler: () => {
                this.dismissApp();
              }
            },
            {
              text: 'Update',
              handler: () => {
                this.market.open('com.GrazieLoyalty.tech');
                  //const browser = this.iab.create('https://play.google.com/store/apps/details?id=com.ioicframework.GrazieLoyalty', '_self', { location: 'no' });
                }
              }
            ],
            enableBackdropDismiss: false
            });
          alert.present();
        }
        else {
          this.dismissApp();
        }
      }
      else {
        this.dismissApp();
      }

    }, (err) => {
      this.alertNonResponse()
      console.log(err)
    })
  }

  alertNonResponse() {
    if (this.alertPresented) {
      return;
    }
    this.alertPresented = true;
    let alert = this.alertCtrl.create({
      title: 'Server Error',
      subTitle: 'Could not connect to server. Please try again after some time.',
      buttons: [
        {
          text: 'Exit App',
          handler: () => {
            this.alertPresented = false;
            this.dismissApp();
          }
        }
      ],
      enableBackdropDismiss: false
    });
    alert.present();
  }

  retryNetworkCheck() {
    if (!this.cp.isOnline()) {
      this.networkErrorAlert()
    }
    else {
      if (!this.verifyDone) {
        this.verify();
      }
      else {
        this.dismissApp();
      }
    }
  }

  networkErrorAlert() {
    if (this.alertPresented) {
      return;
    }
    this.alertPresented = true;
    this.networkAlert = this.alertCtrl.create({
      title: 'No Internet connection',
      message: 'Please check your connection and try again',
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Exit',
          handler: () => {
            this.alertPresented = false;
            console.log('Exit clicked');
            this.platform.exitApp();
          }
        },
        {
          text: 'Retry',
          handler: () => {
            this.alertPresented = false;
            this.retryNetworkCheck()
          }
        }
      ]
    });
    this.networkAlert.present();
  }

}
