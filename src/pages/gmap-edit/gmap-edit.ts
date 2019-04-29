import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ViewController, Platform } from 'ionic-angular';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { ConnectivityProvider } from '../../providers/connectivity/connectivity';
import { StoreService } from '../../providers/index';
import { StoremanagerComponent } from '../storemanager/storemanager';
import { LocalstorageProvider } from '../../providers/localstorage/localstorage'

declare var google;

@Component({
  selector: 'page-gmap-edit',
  templateUrl: 'gmap-edit.html',
})
export class GmapEditPage {
  @ViewChild('map2') mapElement: ElementRef;

	autocompleteItems: any;
	autocomplete: any;
	lat: number = 20.593684;
	lng: number = 78.96288;
	zoom: number = 11;
	private map: any;
	geourl = '';
	marker: any;
	markerArray: any;
	currentPosition: any;
	mapLoaded = false;

	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		private zone: NgZone,
		public platform: Platform,
		public alertCtrl: AlertController,
		public CP: ConnectivityProvider,
		private localStorage: LocalstorageProvider,
		private storeService: StoreService) {		
		this.currentPosition = this.navParams.data;
	}

	ionViewDidEnter() {
		this.loadMap();
	}

	loadMap() {

		try {
			if (this.CP.isOnline()) {
				// create a new map by passing HTMLElement
        this.lat = Number(this.currentPosition.lat);
        this.lng = Number(this.currentPosition.lng);

        let latLng = new google.maps.LatLng(this.lat, this.lng);       

        let mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        var me = this;

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

        this.map.addListener('drag', ()=> {
          let position: any = me.map.getCenter();
          me.currentPosition.lat = position.lat();
          me.currentPosition.lng = position.lng();

          if (me.marker !== undefined) {
            me.marker.setPosition(new google.maps.LatLng(me.currentPosition.lat, me.currentPosition.lng));
          }
        });

        me.marker = new google.maps.Marker({
          map: me.map,
          animation: google.maps.Animation.DROP,
          draggable: false,
          icon: {
            url: "./assets/images/pin-pos.png"
          },
          position: latLng
        });
			}
		}
		catch (err) {
      console.log(err)
			console.log('error loading map')
			//document.getElementById("demo2").innerHTML = "test2";
			//document.getElementById("demo").innerHTML = err.message;
		}
	};

	saveLoc() {
		this.localStorage.coordinates[0] = this.currentPosition.lat;
		this.localStorage.coordinates[1] = this.currentPosition.lng;
		this.navParams.get("parent").locationChanged();
		this.navCtrl.pop();
	}

	cancel() {
		this.navParams.get("parent").locationUnchanged();
		this.navCtrl.pop();
	}

}
