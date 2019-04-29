import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { APP_BASE_HREF } from '@angular/common';
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { Network } from '@ionic-native/network';
import { DatePipe } from '@angular/common'; 

import { File } from '@ionic-native/file';
import { Transfer } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';

import { NativeGeocoder } from '@ionic-native/native-geocoder';

import {
  AuthenticationService, RetailerService, ValidationService,
  StoreService, CommonService, UserService
} from '../providers/index';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { InAppBrowser } from '@ionic-native/in-app-browser'; 
import { Ionic2RatingModule } from 'ionic2-rating';
import { GooglePlus } from '@ionic-native/google-plus';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { Market } from '@ionic-native/market';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { MyApp } from './app.component';
import { LoginComponent } from '../pages/login/login';
import { DashboardComponent } from '../pages/dash/dashboard';
import { StoremanagerComponent } from '../pages/storemanager/storemanager';
import { StoreComponent } from '../pages/store/store';
import { StoreEditComponent, KeywordSearchPage } from '../pages/storeedit/storeedit';
import { StoreRegisterComponent, SearchPage, AddContactModel } from '../pages/storeregister/storeregister';
import { GmapPage, AutocompletePage } from '../pages/gmap-modal/gmap'
import { SplashPage } from '../pages/splash/splash';
import { RegisterPage } from '../pages/register/register'
import { ConnectivityProvider } from '../providers/connectivity/connectivity';
import { GoogleauthProvider } from '../providers/googleauth/googleauth';
import { LocalstorageProvider } from '../providers/localstorage/localstorage';
import { SocketioProvider } from '../providers/socketio/socketio';
import { BillingPage, RewardType, SelectOffer } from '../pages/billing/billing'
import { ContactPage } from '../pages/contact/contact'
import { AccountPage } from '../pages/account/account'
import { OfferPage } from '../pages/offer/offer'
import { CartPage } from '../pages/cart/cart'
import { CartbillingPage } from '../pages/cartbilling/cartbilling'
import { InventoryPage, PopoverPage } from '../pages/inventory/inventory'
import { SettlePage } from '../pages/settle/settle'
import { Register2Page } from '../pages/register2/register2'
import { GmapEditPage } from '../pages/gmap-edit/gmap-edit'
import { StoreDashPage } from '../pages/store-dash/store-dash'
import { PaymenthistoryPage, PaymentPage } from '../pages/paymenthistory/paymenthistory'
import { SaleshistoryPage, SaleDetailPage } from '../pages/saleshistory/saleshistory'
import { RechargePage, BillPlanPopover } from '../pages/recharge/recharge'
import { CustomerPage, TransactionPage } from '../pages/customer/customer'
import { FeedbacksPage } from '../pages/feedbacks/feedbacks'
import { PinScreenPage } from '../pages/pin-screen/pin-screen'
import { QrScanPage } from '../pages/qr-scan/qr-scan'
import * as myVars from '../config';
const config: SocketIoConfig = { url: myVars.BASE_API_URL, options: {} };

@NgModule({
  declarations: [
  MyApp,
  LoginComponent,
  DashboardComponent,
  StoremanagerComponent,
  StoreComponent,
  StoreEditComponent, KeywordSearchPage,
  StoreRegisterComponent, SearchPage, AddContactModel,
  GmapPage, AutocompletePage,
  SplashPage,
  RegisterPage,
  BillingPage, RewardType, SelectOffer,
  AccountPage,
  ContactPage,
  Register2Page,
  SettlePage,
  OfferPage,
  CartPage, PopoverPage,
  CartbillingPage,
  InventoryPage,
  GmapEditPage,
  StoreDashPage,
  PaymenthistoryPage, PaymentPage,
  SaleshistoryPage, SaleDetailPage,
  RechargePage, BillPlanPopover,
  CustomerPage, TransactionPage,
  FeedbacksPage,
  PinScreenPage,
  QrScanPage
  ],
  imports: [
  BrowserModule,
  HttpModule,
  FormsModule,
  BrowserAnimationsModule,
  Ionic2RatingModule,
  IonicModule.forRoot(MyApp),
  IonicStorageModule.forRoot(),
  SocketIoModule.forRoot(config)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
  MyApp,
  LoginComponent,
  DashboardComponent,
  StoremanagerComponent,
  StoreComponent,
  StoreEditComponent, KeywordSearchPage,
  StoreRegisterComponent, SearchPage, AddContactModel,
  GmapPage, AutocompletePage,
  SplashPage,
  RegisterPage,
  BillingPage, RewardType, SelectOffer,
  AccountPage,
  ContactPage,
  Register2Page,
  SettlePage,
  OfferPage,
  CartPage, PopoverPage,
  CartbillingPage,
  InventoryPage,
  GmapEditPage,
  StoreDashPage,
  PaymenthistoryPage, PaymentPage,
  SaleshistoryPage, SaleDetailPage,
  RechargePage, BillPlanPopover,
  CustomerPage, TransactionPage,
  FeedbacksPage,
  PinScreenPage,
  QrScanPage
  ],
  providers: [
  File,
  Transfer,
  Camera,
  FilePath,
  StatusBar,
  SplashScreen,
  AuthenticationService,
  RetailerService,
  StoreService,
  ValidationService,
  CommonService,
  UserService,
  { provide: LocationStrategy, useClass: HashLocationStrategy },
  { provide: APP_BASE_HREF, useValue: '/' },
  {provide: ErrorHandler, useClass: IonicErrorHandler},
  ConnectivityProvider,
  Network,
  NativeGeocoder,
  GoogleauthProvider,
  LocalstorageProvider,
  DatePipe,
  GooglePlus,
  ScreenOrientation,
  PhotoViewer,
  InAppBrowser,
  Market,
  SocketioProvider,
  UniqueDeviceID,
  BarcodeScanner
  ]
})
export class AppModule {}
