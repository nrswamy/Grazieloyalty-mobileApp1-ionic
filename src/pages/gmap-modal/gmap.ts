import { Component, NgZone, ElementRef, ViewChild } from '@angular/core';
import { ViewController, Platform, ModalController, Searchbar } from 'ionic-angular'; 
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { ConnectivityProvider } from '../../providers/connectivity/connectivity';
import { StoreService, CommonService } from '../../providers/index';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';
import { StoremanagerComponent } from '../storemanager/storemanager';
import { Keyboard } from 'ionic-native';

declare var google;

@Component({
  selector: 'page-gmap',
  templateUrl: 'gmap.html',
})
export class GmapPage {
  @ViewChild('mapElement', { read: ElementRef }) private mapElement: ElementRef;
  autocompleteItems:any;
  autocomplete:any;

  address;
  lat: number = 20.593684;
  lng: number = 78.96288;
  zoom: number = 11;
  private map: any;
  formdata:any;
  marker: any;
  currentPosition:any;
  mapLoaded = false;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public viewCtrl: ViewController, 
    private zone: NgZone,
    public platform: Platform,
    public alertCtrl: AlertController,
    public CP: ConnectivityProvider,
    private nativeGeocoder: NativeGeocoder,
    private modalCtrl: ModalController,
    private storeService: StoreService ) {

    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    };
    this.address = {
      place: ''
    };  

  }

  ionViewDidEnter() {
    this.formdata = this.navParams.data;
    setTimeout(() => {
      this.loadMap(this.formdata.city);
    }, 500);    
    
  }

  showAddressModal() {
    let modal = this.modalCtrl.create(AutocompletePage);
    let me = this;
    modal.onDidDismiss(data => {
      if(data) {

        this.address.place = this.text_truncate(data, 50)
        let addr = this.address.place;

        var geocoder = new google.maps.Geocoder();
        var address = addr;

        geocoder.geocode({ 'address': address, 'region': 'IN' }, function(results, status) {

          var latitude = results[0].geometry.location.lat();
          var longitude = results[0].geometry.location.lng();
          if(latitude) {
            let pos = new google.maps.LatLng(latitude, longitude);

            let position = {
              target: pos,
              zoom: 15
            };

            if (me.map !== undefined) {
              me.map.setCenter(pos)
            }

            if (me.marker !== undefined) {
              me.marker.setPosition(new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude)));
            }
          }
        })
      }      
    });
    modal.present();
  }

  text_truncate(str, length) {
    let ending = '...';
    if (length == null) {
      length = 100;
    }
    if (str.length > length) {
      return str.substring(0, length - ending.length) + ending;
    } else {
      return str;
    }
  };

  chooseItem(item: any) {
    console.log(item)
    this.autocomplete.query = ''
    this.autocompleteItems = [];
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  updateSearch() {
    if (this.autocomplete.query == '') {
      this.autocompleteItems = [];
      return;
    }
    let me = this;

    var request = {
      input: this.autocomplete.query,
      componentRestrictions: { country: 'IN' },
      types: ['geocode']
    };
  }

  loadMap(place) {

    try {
      console.log('inside try')
      if (this.CP.isOnline()) {

        this.address.place = this.text_truncate(place, 50)
        let addr = this.address.place;

        var geocoder = new google.maps.Geocoder();
        var address = addr;

        var me = this;

        geocoder.geocode({ 'address': address, 'region': 'IN' }, function(results, status) {

          var latitude = results[0].geometry.location.lat();
          var longitude = results[0].geometry.location.lng();

          me.lat = Number(latitude);
          me.lng = Number(longitude);
          me.currentPosition = { lat: me.lat, lng: me.lng }

          let latLng = new google.maps.LatLng(me.lat, me.lng);

          if (latitude) {
            let pos = new google.maps.LatLng(latitude, longitude);

            let position = {
              target: pos,
              zoom: 15
            };

            let mapOptions = {
              center: pos,
              zoom: 15,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            }

            me.map = new google.maps.Map(document.getElementById('mapElement'), mapOptions);

            me.marker = new google.maps.Marker({
              map: me.map,
              animation: google.maps.Animation.DROP,
              icon: {
                url: "./assets/images/pin-pos.png"
              },
              position: latLng
            });

            me.map.addListener('drag', () => {
              let position: any = me.map.getCenter();
              me.currentPosition.lat = position.lat();
              me.currentPosition.lng = position.lng();

              if (me.marker !== undefined) {
                me.marker.setPosition(new google.maps.LatLng(me.currentPosition.lat, me.currentPosition.lng));
              }
            });
          }
        })
      }
    }
    catch (err) {
      console.log('err loading map')
    }
  };

  saveStore() {
    let pos = this.currentPosition;
    this.formdata['pos'] = pos;
    console.log(this.formdata)
    this.storeService.addStore(this.formdata).subscribe(
      data => {

        this.navCtrl.setRoot(StoremanagerComponent);
      },
      error => {
      });
  }
}

@Component({
  template: `
  <ion-header>
  <ion-toolbar>
  <ion-title>Enter Location</ion-title>
  <ion-searchbar #mainSearchbar [(ngModel)]="autocomplete.query" [showCancelButton]="true"   (ionInput)="updateSearch()" (ionCancel)="dismiss()"></ion-searchbar>
  </ion-toolbar>
  </ion-header>

  <ion-content>
  <ion-list>
  <ion-item *ngFor="let item of autocompleteItems" tappable   (click)="chooseItem(item)">
  {{ item }}
  </ion-item>
  </ion-list>
  </ion-content>
  `
})

export class AutocompletePage {
  @ViewChild('mainSearchbar') searchBar: Searchbar;
  autocompleteItems;
  autocomplete;

  constructor(public viewCtrl: ViewController,
    private cs: CommonService,
    private zone: NgZone) {
    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    };
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.searchBar.setFocus();
    }, 150);
  }

  chooseItem(item: any) {
    this.viewCtrl.dismiss(item);
  }

  updateSearch() {
    try {
      if (this.autocomplete.query == '') {
        this.autocompleteItems = [];
        return;
      }
      let me = this;
      me.cs.searchAddr(this.autocomplete.query).then((response) => {
        if (response && response.success) {
          this.autocompleteItems = [];
          if (response.data) {
            response.data.forEach(function(prediction) {
              me.autocompleteItems.push(prediction.address);
            });
          }
        }
      });
    }
    catch (e) {
      console.log('err=>' + e)
    }
  }
}