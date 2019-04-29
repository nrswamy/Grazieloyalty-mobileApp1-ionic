import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ModalController, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import firebase from 'firebase';

import { LoginComponent } from '../pages/login/login';
import { DashboardComponent } from '../pages/dash/dashboard';
import { StoremanagerComponent } from '../pages/storemanager/storemanager';
import { LocalstorageProvider } from '../providers/localstorage/localstorage';
import { ContactPage } from '../pages/contact/contact'
import { CustomerPage } from '../pages/customer/customer'
import { AccountPage } from '../pages/account/account'
import { SettlePage } from '../pages/settle/settle'
import { PaymenthistoryPage } from '../pages/paymenthistory/paymenthistory'
import { SaleshistoryPage } from '../pages/saleshistory/saleshistory'
import { FeedbacksPage } from '../pages/feedbacks/feedbacks'
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { GoogleauthProvider } from '../providers/googleauth/googleauth'

@Component({
  selector: 'page-menu',
  templateUrl: 'app.html' 
}) 
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginComponent;
  dict = {};

  constructor(public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen,
    private storage: Storage,
    private googleAuth: GoogleauthProvider,
    private localStorage: LocalstorageProvider,
    private modalCtrl: ModalController,
    public menuCtrl: MenuController,
    private screenOrientation: ScreenOrientation) {

    this.initializeApp();

    firebase.initializeApp({
      apiKey: "",
      authDomain: "grazie-retailer-app.firebaseapp.com",
      databaseURL: "https://grazie-retailer-app.firebaseio.com",
      projectId: "grazie-retailer-app",
      storageBucket: "",
      messagingSenderId: ""
    });

    // used for an example of ngFor and navigation

    this.dict = {
      'Dashboard': DashboardComponent, 'Store Manager': StoremanagerComponent, 'Settle Balance': SettlePage, 'Sales History': SaleshistoryPage, 'My Payments': PaymenthistoryPage, 'My Account': AccountPage, 'Contact': ContactPage, 'My Customer': CustomerPage, 'Customer Feedbacks': FeedbacksPage
    }

  }

  ionViewDidEnter() {
    this.menuCtrl.swipeEnable(true)
  }

  initializeApp() {
    this.platform.ready().then(() => {      

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      //this.splashScreen.hide();

      if (this.platform.is('tablet')) {
        console.log('platform is tablet')
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
      }
      else if (this.platform.is('mobile') && !this.platform.is('mobileweb')) {
        console.log('platform is phone')
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      }   
    });

  }

  Logout() {
    this.localStorage.clearStorage();
    this.googleAuth.logout().then((user)=>{
      console.log(user)
    }, (err)=>{
      console.log(err)
    });
    this.nav.setRoot(LoginComponent);
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    if (page.title == 'Sales History' || page.title == 'My Payments' || page.title == 'My Customer' || page.title == 'Customer Feedbacks') {
      //this.nav.push(this.dict[page.title]);
      let detailModal = this.modalCtrl.create(this.dict[page.title]);

      detailModal.present();
    }
    else {
      this.nav.setRoot(this.dict[page.title]);
    }
  }
}
