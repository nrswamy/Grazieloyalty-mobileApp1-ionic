import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController } from 'ionic-angular';
import { StoreEditComponent } from '../storeedit/storeedit';
import { Content } from 'ionic-angular';
import { BillingPage } from '../billing/billing'
import { CartbillingPage } from '../cartbilling/cartbilling'
import { StoreService } from '../../providers/index'
import { CommonService } from '../../providers/index'
import { LocalstorageProvider } from '../../providers/localstorage/localstorage'
import { InventoryPage } from '../inventory/inventory'
import { StoreDashPage } from '../store-dash/store-dash'
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { ConnectivityProvider } from '../../providers/connectivity/connectivity';

declare var google;

@Component({
	selector: 'page-store',
	templateUrl: 'store.html'
})
export class StoreComponent {
  @ViewChild(Content) content: Content;
  @ViewChild('storemap') mapElement: ElementRef;
  private data: any;
  private navData: any;
  public newOffers = [];
  public images = [];
  imageData = {
    profile: null,
    images: []
  };
  dataLoaded = false;
  showMap = true;

  lat: number = 20.593684;
  lng: number = 78.96288;
  zoom: number = 11;
  map: any;
  geourl = '';
  markerArray: any;
  currentPosition: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storeService: StoreService,
    private cs: CommonService,
    public CP: ConnectivityProvider,
    private lp: LocalstorageProvider,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private photoViewer: PhotoViewer) {

  }

  ionViewCanEnter() {
    this.lp.pages[2].visible = true;
    this.lp.pages[3].visible = true;
    this.lp.pages[6].visible = true;
  }

  ionViewCanLeave() {
    this.lp.pages[2].visible = false;
    this.lp.pages[3].visible = false;
    this.lp.pages[6].visible = false;
  }

  ionViewDidLoad() {
    this.showMap = true;
    setTimeout(() => {
      this.getStoreData();
    }, 100);
  }

  ionViewDidEnter(){
    this.showMap = true;
    setTimeout(() => {
      if(this.lp.fromStoreEdit) {
        this.lp.fromStoreEdit = false;
        this.getStoreData();
      }			
    }, 100);
  }

  doRefresh(refresher) {
    this.getStoreData(); 
    setTimeout(() => {
      refresher.complete();
    }, 1000);
  }


  getStoreData() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...',
      duration: 6000
    });

    loading.present();
    this.navData = this.navParams.data;
    this.storeService.getStore(this.navData._id).subscribe((data) => {
      loading.dismiss();    
      if(data.success) {
        this.data = data.store;
        if (this.data.storeImages != '') {
          this.images = this.data.storeImages.split('$$$')
          if (this.images[0] == "") {
            this.images.shift()
          }
        }
        this.getThumbs();
        this.newOffers = [];
        for (let index = 0; index < this.data.offers.length; index++) {
          this.newOffers.push(this.data.offers[index].offerString)
        }
        this.dataLoaded = true;        		
      }		
    },
    (err) => {
      loading.dismiss();
      console.log(err)
    })
  }

  getThumbs() {
    this.cs.getImageThumbUrl(0, this.data.profileImageUrl).then((data) => {
      if(data.success) {
        this.imageData.profile = data.url;
      }		
    })

    if (this.images) {
      for (var i = 0; i < this.images.length; i++) {
        this.imageData.images[i] = '';
      }
      for (var i = 0; i < this.images.length; i++) {
        this.cs.getImageThumbUrl(i, this.images[i]).then((data) => {
          this.imageData.images[data.index] = data.url;
        }, (error) => {
          console.log('error')
        })
      }
    }
  }

  editStore() {
    this.showMap = false;
    /*if(this.map) {
      this.map.remove();
    } */   
    this.navCtrl.push(StoreEditComponent, this.data);
  }

  addBilling() {
    var info = {
      cartBilling: false,
      storeInfo: this.data
    }
    this.navCtrl.push(BillingPage, info);
  }

  viewImage() {
    console.log('opening image')
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();
    this.cs.getImageUrl(0, this.data.profileImageUrl).then((data) => {
      loading.dismiss();
      if (data.success) {
        this.photoViewer.show(data.url, '', { share: false });
      }
    })		
  }

  viewStoreImage(index:number) {
    console.log('opening image')
    let loading = this.loadingCtrl.create({
      content: 'Please wait...',
      duration: 6000
    });

    loading.present();
    this.cs.getImageUrl(index, this.images[index]).then((data) => {
      loading.dismiss();
      if (data.success) {
        this.photoViewer.show(data.url, '', { share: false });
      }
    })
  }

  addImage() {
    console.log('addimage')
  }

  addCartBill() {
    this.navCtrl.push(CartbillingPage, this.data);
  }

  viewDashboard() {
    this.navCtrl.push(StoreDashPage, this.data);
  }

  manageInventory() {
    this.navCtrl.push(InventoryPage, this.data)
  }

  viewMapImage() {
    this.photoViewer.show(this.data.staticmap, '', { share: false });
  }

}