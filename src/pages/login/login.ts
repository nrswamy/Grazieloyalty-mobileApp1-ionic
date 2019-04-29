import { Component, OnInit, trigger, state, style, transition, animate, keyframes, ViewChild } from '@angular/core';
import { Nav, NavController, NavParams, MenuController, Platform, IonicApp, ModalController } from 'ionic-angular';
import { AuthenticationService, StoreService } from '../../providers/index';
import { DashboardComponent } from '../dash/dashboard'
import { LocalstorageProvider } from '../../providers/localstorage/localstorage'
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { Market } from '@ionic-native/market';
import { LoadingController } from 'ionic-angular';
import { RegisterPage } from '../register/register'
import firebase from 'firebase';
import { StoremanagerComponent } from '../storemanager/storemanager'
import { SplashPage } from '../splash/splash';
import { RetailerService, CommonService } from '../../providers/index'
import { ConnectivityProvider } from '../../providers/connectivity/connectivity'
import { Network } from '@ionic-native/network';
import { AlertController } from 'ionic-angular';
import { GoogleauthProvider } from '../../providers/googleauth/googleauth'
import { Register2Page } from '../register2/register2'
import { AccountPage } from '../account/account'

@Component({
  selector: 'login',
  templateUrl: 'login.html',
  providers: [AuthenticationService],
  animations: [

    //For the logo
    trigger('flyInLeftSlow', [
      state('in', style({
        transform: 'translate3d(0,0,0)'
      })),
      transition('void => *', [
        style({ transform: 'translate3d(2000px,0,0' }),
        animate('2000ms 500ms ease-in-out')
        ])
      ]),

    //For the background detail
    trigger('flyInRightSlow', [
      state('in', style({
        transform: 'translate3d(0,0,0)'
      })),
      transition('void => *', [
        style({ transform: 'translate3d(-2000px,0,0)' }),
        animate('2000ms 500ms ease-in-out')
        ])
      ]),

    //For the login form
    trigger('bounceInBottom', [
      state('in', style({
        transform: 'translate3d(0,0,0)'
      })),
      transition('void => *', [
        animate('2000ms 200ms ease-in', keyframes([
          style({ transform: 'translate3d(0,2000px,0)', offset: 0 }),
          style({ transform: 'translate3d(0,-20px,0)', offset: 0.9 }),
          style({ transform: 'translate3d(0,0,0)', offset: 1 })
          ]))
        ])
      ]),

    //For login button
    trigger('fadeIn', [
      state('in', style({
        opacity: 1
      })),
      transition('void => *', [
        style({ opacity: 0 }),
        animate('1000ms 2000ms ease-in')
        ])
      ])
    ]
  })
export class LoginComponent {
  @ViewChild(Nav) nav: Nav;

  text: string;
  data: any = {};
  loading = false;
  returnUrl: string;
  stores: any;
  backClikCount = false;
  backClikCount1 = false;
  logoState: any = "in";
  cloudState: any = "in";
  loginState: any = "in";
  formState: any = "in";
  verifyDone = false;
  networkAlert: any;
  userLoggedin = false;
  alertPresented = false;
  uuid = "";
  public userProfile: any = null;

  constructor(
    public platform: Platform,
    private menu: MenuController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private authenticationService: AuthenticationService,
    private storeService: StoreService,
    private googleAuth: GoogleauthProvider,
    private iab: InAppBrowser,
    private localStorage: LocalstorageProvider,
    public loadingCtrl: LoadingController,
    private uniqueDeviceID: UniqueDeviceID,
    private retailers: RetailerService,
    private cs: CommonService,
    private network: Network,
    private market: Market,
    public ionicApp: IonicApp,
    private modalCtrl: ModalController,
    private cp: ConnectivityProvider,
    public alertCtrl: AlertController) {

    platform.registerBackButtonAction(() => {
      console.log("Back button action called");

      let activePortal = ionicApp._loadingPortal.getActive() || ionicApp._modalPortal.getActive() || ionicApp._toastPortal.getActive() || ionicApp._overlayPortal.getActive();

      if (activePortal) {
        activePortal.dismiss();
        console.log("handled with portal");
        return;
      }

      if (menu.isOpen()) {
        menu.close();
        return;
      }

      let view = this.navCtrl.getActive();
      let page = view ? this.navCtrl.getActive().instance : null;

      if (this.navCtrl.canGoBack() || view && view.isOverlay) {
        console.log("popping back");
        this.navCtrl.pop();
      }
      else if (!this.userLoggedin) {
        console.log("Not yet logged in... exiting");
        if (!this.backClikCount) {
          this.backClikCount = true;
        }
        else {
          this.backClikCount = false;
          this.alertExit();
        }
      }
      else if (!this.localStorage.isRootPage) {
        console.log('not in root page')
        this.navCtrl.setRoot(StoremanagerComponent)
      }
      else {
        console.log('root page')
        if (!this.backClikCount1) {
          this.backClikCount1 = true;
        }
        else {
          this.backClikCount1 = false;
          this.alertExit();
        }
      }

    }, 1);

  }

  alertExit() {
    this.alertCtrl.create({
      title: 'Confirmation',
      message: 'Do you really want to exit?',
      buttons: [
      {
        text: 'Cancel',
        handler: () => {
        }
      },
      {
        text: 'Yes',
        handler: () => {
          this.platform.exitApp();
        }
      }
      ]
    }).present();
  }

  ionViewDidEnter() {
    this.menu.swipeEnable(true);
    this.userLoggedin = false;
    this.localStorage.isRootPage = true;

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.userProfile = user;
      } else {
        this.userProfile = null;
      }
    });
  }

  ionViewDidLoad() {

    let splash = this.modalCtrl.create(SplashPage);
    splash.onDidDismiss(()=>{
      this.verifyLoginState()
    })
    splash.present();

    let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.networkErrorAlert();
    });

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

  retryNetworkCheck() {
    if (!this.cp.isOnline()) {
      this.networkErrorAlert()
    }
  }

  ionViewWillEnter() {
    let plts = this.platform.platforms();
    var temp = ''

    for (var i = 0; i < plts.length ; i++) {
      temp = temp + plts[i]
    }

    this.uuid = temp;
    this.uniqueDeviceID.get()
      .then((uuid: any) => {
        this.uuid = temp + uuid;
        console.log(this.uuid)
      })
      .catch((error: any) => console.log(error));
  }

  verifyLoginState() {
    this.localStorage.getItem('token').then((token) => {
      let loader = this.loadingCtrl.create({
        content: "Please wait...",
        duration: 6000
      });
      loader.present();
      this.retailers.verfiyToken(this.uuid).subscribe((data) => {
        loader.dismiss()
        if (data.success == true) {
          this.userLoggedin = true;
          this.localStorage.isRootPage = false;
          this.navCtrl.setRoot(StoremanagerComponent);
        }
        else {
          console.log('token invalid')
        }
      }, (err) => {
        loader.dismiss()
        console.log(err)
      })
    })
  }

  login() {

    let serverResponded = false;
    if (!this.data.username || !(/^\d{10}$/.test(this.data.username))) {
      let alert = this.alertCtrl.create({
        message: 'Enter a valid mobile number',
        buttons: ['OK']
      });
      alert.present();
      return;
    }

    if (!this.data.password || (this.data.password == '')) {
      let alert = this.alertCtrl.create({
        message: 'Password cannot be empty',
        buttons: ['OK']
      });
      alert.present();
      return;
    }

    let loader = this.loadingCtrl.create({
      content: "Authenticating...",
      duration: 6000
    });
    loader.present();
    var timer = setTimeout(() => {      
      if (!serverResponded) {
        loader.dismiss();
        this.alertNonResponse();
      }
    }, 6000);
    this.authenticationService.loginRetailer(this.data.username.toString(), this.data.password, this.uuid)
    .subscribe(
      data => {
        serverResponded = true;
        if (timer) {
          clearTimeout(timer);
          timer = 0;
        }
        let user = data;

        if (!data.success) {
          let alert = this.alertCtrl.create({
            title: 'Login Error',
            subTitle: 'Invalid username or Passowrd',
            buttons: [
            {
              text: 'Ok',
              handler: () => {
                loader.dismiss();
              }
            }
            ]
          });
          alert.present();
        }
        else if (user && user.token) {
            //console.log(data)

            // store user details and jwt token in local storage to keep user logged in between page refreshes
            this.localStorage.clearStorage()
            this.localStorage.setToken(user.token);
            this.localStorage.setItem('userData', user);
            this.userLoggedin = true;
            this.localStorage.isRootPage = false;
            this.navCtrl.setRoot(StoremanagerComponent);
            loader.dismiss();
          }

        },
        error => {
          if (timer) {
            clearTimeout(timer);
            timer = 0;
          }
          console.log('test 2222')
          this.alertNonResponse();
          loader.dismiss();
        });
  }

  register() {
    this.navCtrl.push(RegisterPage);
  }

  alertNonResponse() {
    console.log('sdlfjdkbgldabglj')
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
          this.platform.exitApp();
        }
      },
      {
        text: 'Ok',
        handler: () => {
          this.alertPresented = false;
        }
      }
      ]
    });
    alert.present();
  }

  loginGoogle() {
    let loader = this.loadingCtrl.create({
      content: "Authenticating...",
      duration: 6000
    });
    loader.present();

    this.googleAuth.login().then((response) => {
      this.googleAuth.verifyUser({ email: response.email, deviceId :this.uuid}).then((res) => {
        if (res.exists) {
          let user = res;
          this.localStorage.clearStorage()
          this.localStorage.setToken(user.token);
          this.localStorage.setItem('userData', user);
          loader.dismiss();
          this.userLoggedin = true;
          this.localStorage.isRootPage = false;
          this.navCtrl.setRoot(StoremanagerComponent);
        }
        else if (!res.success) {
          console.log('result not success')
          loader.dismiss();
          this.googleAuth.logout();
          this.retryGoogleLogin();
        }
        else {
          console.log('result success')
          var data = {
            'fullname': response.fullname, 'email': response.email, 'mobile_no': ''
          }
          loader.dismiss();
          this.navCtrl.push(Register2Page, data);
        }
      }).catch(err => {
        loader.dismiss();
        console.log(err)
        this.googleAuth.logout();
      })
    }).catch(err => { loader.dismiss(); })
  }

  retryGoogleLogin() {
    let confirm = this.alertCtrl.create({
      title: 'Error',
      message: 'Login error. Pelease try again after some time',
      buttons: [
      {
        text: 'Ok',
        handler: () => {
          this.navCtrl.setRoot(LoginComponent);
        }
      },
      {
        text: 'Retry',
        handler: () => {
          this.loginGoogle()
        }
      }
      ]
    });
    confirm.present();
  }

  forgotPassword() {
    let alert = this.alertCtrl.create({
      title: 'Enter your mobile number',
      inputs: [
      {
        name: 'mobile',
        placeholder: 'Mobile Number',
        type: 'number'
      }
      ],
      buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Update',
        handler: data => {
          let mobile = data.mobile;
          if (/^\d{10}$/.test(mobile)) {
            this.retailers.searchRetailerbyMob(mobile).then((data) => {
              if (data.exists && data.success) {
                  // value is ok, use it
                  this.verifyMobile(mobile)
                }
                else if (!data.exists && data.success) {
                  let confirm = this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'This mobile number is not registered',
                    buttons: ['Ok']
                  });
                }
                else {
                  this.handleError()
                }
              }, (err) => {
                this.handleError()
              })
          }
          else {
            let confirm = this.alertCtrl.create({
              title: 'Error',
              subTitle: 'Enter a valid mobile number',
              buttons: ['Ok']
            });
            confirm.present();
          }
        }
      }
      ]
    });
    alert.present();
  }

  verifyMobile(mobile) {
    let loader = this.loadingCtrl.create({
      content: "Authenticating...",
      duration: 6000
    });
    loader.present();

    this.cs.generateOTP(mobile).subscribe(
      data => {
        this.showPrompt(mobile);
        loader.dismiss();
      },
      error => {
        this.handleError()
        loader.dismiss();
      });
  }

  showPrompt(mobile) {
    let prompt = this.alertCtrl.create({
      title: 'Verify',
      message: 'Enter otp that was sent via SMS',
      inputs: [
      {
        name: 'code',
        placeholder: 'Code'
      },
      ],
      buttons: [
      {
        text: 'Cancel',
        handler: data => {
          return;
        }
      },
      {
        text: 'Verify',
        handler: data => {
          let loader = this.loadingCtrl.create({
            content: "Authenticating...",
            duration: 6000
          });
          loader.present();
          this.authenticationService.loginRetailerWithOTP({ mobile_no: mobile, otp: data.code, deviceId: this.uuid }).then((data) => {
            if (data.success) {
              this.localStorage.clearStorage()
              this.localStorage.setToken(data.token);
              this.localStorage.setItem('userData', data);
              this.updatePassword();
            }
            else {
              let confirm = this.alertCtrl.create({
                title: 'Error',
                subTitle: 'Invalid OTP!',
                buttons: [
                {
                  text: 'Ok',
                  handler: data => {
                    this.showPrompt(mobile)
                  }
                }]
              });
              confirm.present();
            }
            loader.dismiss();
          }, (err) => {
            this.handleError()
            loader.dismiss();
          })
        }
      }
      ]
    });
    prompt.present();
  }

  updatePassword() {
    let alert = this.alertCtrl.create({
      title: 'Update Password',
      inputs: [
      {
        name: 'new',
        placeholder: 'new password',
        type: 'password'
      },
      {
        name: 'confirm',
        placeholder: 'confirm password',
        type: 'password'
      }
      ],
      buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Update',
        handler: data => {
          let newPassword = data.new;
          let confirmPassword = data.confirm;
          let loader = this.loadingCtrl.create({
            content: "Authenticating...",
            duration: 6000
          });
          loader.present();

          if (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(newPassword)) {
            this.retailers.updatepw({ new: newPassword }).then((response) => {
              loader.dismiss();
              let alert = this.alertCtrl.create({
                title: 'Success!',
                subTitle: 'Password updated',
                buttons: [{
                  text: 'Ok',
                  handler: data => {
                    loader.dismiss();
                    this.userLoggedin = true;
                    this.localStorage.isRootPage = false;
                    this.navCtrl.setRoot(StoremanagerComponent);
                    return;
                  }
                }]
              });
              alert.present();
            },
            (err) => {
              this.handleError();
              loader.dismiss();
              return;
            })
          }
          else {
            let confirm = this.alertCtrl.create({
              title: 'Invalid Password',
              subTitle: 'Password should contain minimum six characters, at least one character and one number',
              buttons: [{
                text: 'Ok',
                handler: data => {
                  loader.dismiss();
                  this.updatePassword();
                  return;
                }
              }]
            });
            confirm.present();
          }
        }
      }
      ]
    });
    alert.present();
  }

  handleError() {
    let confirm = this.alertCtrl.create({
      title: 'Error',
      subTitle: 'Sorry, Unable to process your request.',
      buttons: ['Ok']
    });
    confirm.present();
  }
}
