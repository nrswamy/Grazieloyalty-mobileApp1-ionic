import { Component, ViewChild, Pipe, PipeTransform, NgZone, ElementRef } from '@angular/core';
import {
	NavController, NavParams, ActionSheetController, ToastController, Content,
	ViewController, ModalController, Platform, LoadingController, Loading, Slides, AlertController
} from 'ionic-angular';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { File } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';
import * as myVars from '../../config';

import { LocalstorageProvider } from '../../providers/localstorage/localstorage'
import { StoreService, CommonService, RetailerService } from '../../providers/index';
import { ConnectivityProvider } from '../../providers/connectivity/connectivity';
import { OfferPage } from '../offer/offer'
import { GmapEditPage } from '../gmap-edit/gmap-edit'
import { AddContactModel } from '../storeregister/storeregister'

declare var cordova: any;
declare var google;

@Component({
	selector: 'storeedit',
	templateUrl: 'storeedit.html'
})

export class StoreEditComponent {
	@ViewChild(Content) content: Content;
  @ViewChild('map1') mapElement: ElementRef;

	private storedata: any = null;
	private data: any = null;
	public query = '';
	public inputOffer = '';
	public keywords = [];
	public categories = [];
	public states = [];
	public filteredList = [];
	public selectedCats = [];
	public selected = [];
	public newOffers = [];
	private storeindex = 0;
	private imageChanged = false;
	private progress = 0;
	private profileImageUrl = 'https://storage.googleapis.com/tanka-smart.appspot.com/Retailers/Images/store.png';
	lastImage: string = null;
	loading: Loading;
	actionSheet: any;
	backPressed = false;
	updated = false;
	asp = false;
	private addImageType = "profile"
	private instoreArray = [];
	imageData = {
		profile: null,
		images: []
	};
	showMap = true;

	lat: number = 20.593684;
	lng: number = 78.96288;
	zoom: number = 11;
  map: any;
  marker: any;
	geourl = '';
  retailerInfo = null;
  offerCount = 0;
  loader = null;
  loaderCount = 0;
  markerArray: any;
  currentPosition: any;
  today = Date.now() + 19800000;

  constructor(private storeService: StoreService,
    private retailers: RetailerService,
    private commonService: CommonService,
    public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    private transfer: Transfer,
    private file: File,
    private filePath: FilePath,
    private ng_zone: NgZone,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public platform: Platform,
    private localStorage: LocalstorageProvider,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private photoViewer: PhotoViewer,
    public CP: ConnectivityProvider,
    private nativeGeocoder: NativeGeocoder,
    public modalCtrl: ModalController) {
    
  }

  ionViewCanEnter() {
    this.localStorage.pages[2].visible = true;
    this.localStorage.pages[3].visible = true;
    this.localStorage.pages[6].visible = true;
  }

  ionViewCanLeave() {
    this.localStorage.pages[2].visible = false;
    this.localStorage.pages[3].visible = false;
    this.localStorage.pages[6].visible = false;
  }

  ionViewWillEnter() {
    this.data = null;
    this.initializeData(this.navParams.data);
  }

  ionViewDidEnter() {
    this.showMap = true;
    this.localStorage.fromStoreEdit = true;  
    var count = 0;
    this.retailers.getRetailerInfo().subscribe((data) => {
      if (data && data.success) {
        this.retailerInfo = data.info;
      }
    },
    (err) => {
      console.log(err)
    })

    this.retailers.getOfferCount().subscribe((data) => {
      if (data && data.success) {
        this.offerCount = data.count;
      }
    })
  }

  incrementLoader() {
    if(this.loaderCount == 0) {
      this.loader = this.loadingCtrl.create({
        content: "Loading...",
        duration: 6000
      });
      this.loader.present()
    }
    this.loaderCount = this.loaderCount + 1;
  }
  decrementLoader() {
    this.loaderCount = this.loaderCount - 1;
    if (this.loaderCount == 0) {
      this.loader.dismiss()
    }
  }

  initializeData(input:any) {
    this.storedata = input;
    this.instoreArray = [];
    this.imageData.images = [];
    this.profileImageUrl = "";

    if (this.storedata.storeImages != '') {
      this.instoreArray = this.storedata.storeImages.split('$$$')
      if (this.instoreArray[0]==""){
        this.instoreArray.shift()
      } 
    }
    this.data = this.storedata;
    this.selected = this.data.keywords;
    this.profileImageUrl = this.data.profileImageUrl;
    this.selectedCats = this.data.category;

    for (let index = 0; index < this.data.offers.length; index++) {
      this.newOffers.push({ title: this.data.offers[index].offerString, startDate: this.today < this.data.offers[index].startDate ? true : false })
    }
    this.loadMap();

    this.getKeywords();
    this.getThumbs();
  }

  getThumbs() {
    this.commonService.getImageThumbUrl(0, this.data.profileImageUrl).then((data) => {
      if (data.success) {
        this.imageData.profile = data.url;
      }
    })

    if (this.instoreArray) {			
      for (var i = 0; i < this.instoreArray.length; i++) {
        this.imageData.images[i] = '';
      }

      for (var i = 0; i < this.instoreArray.length; i++) {
        this.commonService.getImageThumbUrl(i, this.instoreArray[i]).then((data) => {
          this.imageData.images[data.index] = data.url;
        }, (error) => {
          console.log('error')
        })
      }
    }
  }

  UpdateStore() {
    this.data.keywords = this.selected;
    this.data.category = this.selectedCats;
    this.storeService.updateStore(this.data).subscribe(
      data => {
        this.data = data;
        this.storedata[this.storeindex] = this.data;
        this.profileImageUrl = this.data.profileImageUrl;
        this.updated = false;
        this.navCtrl.pop();
				//this.lokiService.setItem('storedata', this.storedata);
			},
			error => {
			});
  }

  remove(item) {
    this.selected.splice(this.selected.indexOf(item), 1);
    this.keywords.push(item)
  }

  updateRequired() {
    this.updated = true;
    this.content.resize();
  }

  showContactModal() {
    let contactModal = this.modalCtrl.create(AddContactModel, { items: this.data.contactNumbers }, {
      cssClass: 'storeregister.scss'
    });
    contactModal.onDidDismiss(data => {
      if (data) {
        this.data.contactNumbers = data;
        this.updateRequired();
      }
    });

    contactModal.present();
  }

  getKeywords() {
    this.commonService.getKeywords().subscribe(
      data => {

        this.keywords = data[0].keywords;
        this.categories = data[0].categories;
        this.states = data[0].states;

        this.commonService.setKeywords(data[0].keywords);
				//console.log(this.categories)
				for (var item of this.selected) {
					var index = this.keywords.indexOf(item);
					if (index > -1) {
						this.keywords.splice(index, 1);
					}
				}
				//console.log(this.keywords)
			},
			error => {
			});
  };

  showModal() {
    let searchModal = this.modalCtrl.create(KeywordSearchPage, {}, {
      cssClass: 'storeedit.scss'
    });
    searchModal.onDidDismiss(data => {
      if (data) {
        this.selected.push(data);
        this.query = '';
        this.filteredList = [];
        this.updateRequired();
        var index = this.keywords.indexOf(data);
        if (index > -1) {
          this.keywords.splice(index, 1);
        }
      }
    });
    searchModal.present();
  }

  addOffer() {
    if (this.retailerInfo && this.retailerInfo.currentPack.packDetails.offers >= this.offerCount) {
      let confirm = this.alertCtrl.create({
        title: 'Upgrade!',
        subTitle: 'You have already published maximum number of Offers allowed for your account. Please upgrade your account to publish more Offers to your customers',
        buttons: [
        {
          text: 'Ok'
        }
        ]
      });
      confirm.present();
    }
    else {
      const offerModal = this.modalCtrl.create(OfferPage, { type: 'Save', storeId: this.data._id, offer: null });
      offerModal.onDidDismiss(() => {
        this.storeService.getStore(this.data._id).subscribe((res1) => {
          if (res1 && res1.success) {
            this.newOffers = [];
            this.data = res1.store;
            for (let index = 0; index < res1.store.offers.length; index++) {
              this.newOffers.push({ title: res1.store.offers[index].offerString, startDate: this.today < res1.store.offers[index].startDate ? true : false })
            }
          }
        }, (err) => {

        })
      });
      offerModal.present();
    }    
  }

  openOffer(index) {
    const offerModal = this.modalCtrl.create(OfferPage, { type: 'Update', storeId: this.data._id, offer:this.data.offers[index] });
    offerModal.onDidDismiss((data) => {
      if(data) {
        this.storeService.getStore(this.data._id).subscribe((res1) => {
          if (res1 && res1.success) {
            this.newOffers = [];
            this.data = res1.store;
            for (let index = 0; index < res1.store.offers.length; index++) {
              this.newOffers.push({ title: res1.store.offers[index].offerString, startDate: this.today < res1.store.offers[index].startDate ? true : false })
            }
          }
        }, (err) => {

        })
      }
    });
    offerModal.present();
  }

  removeOffer(index:number) {
    let rem = {
      storeId: this.data._id,
      offerId: this.data.offers[index]._id
    }
    let msg = 'Are you sure you want to delete the offer \"' + this.newOffers[index].title + '\"? You cannot undo delete after clicking \"Yes\".'
    let confirm = this.alertCtrl.create({
      title: 'Confirm!',
      subTitle: msg,
      buttons: [{
        text: 'No',
        handler: response => {
          //this.updatePassword()
          //confirm.dismiss()
        }
      },
      {
        text: 'Yes',
        handler: response => {
          this.storeService.removeOffer(rem).subscribe((res) => {
            this.storeService.getStore(this.data._id).subscribe((res1) => {
              this.newOffers = [];
              if (res1 && res1.success) {
                this.data = res1;
                for (let index = 0; index < res1.offers.length; index++) {
                  this.newOffers.push({ title: res1.offers[index].offerString, startDate: this.today < res1.offers[index].startDate ? true : false})
                }
              }
            }, (err) => {

            })
          })
        }
      }
      ]
    });
    confirm.present();
  }

  addImage() {
    console.log('addimage')
    this.addImageType = "instore"
    this.presentActionSheet()

  }

  addProfileImage() {
    this.addImageType = "profile"
    this.presentActionSheet()
  }

  public presentActionSheet() {
    this.actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
      {
        text: 'Load from Library',
        icon: 'md-image',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Use Camera',
        icon: 'md-camera',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
      ]
    });
    this.asp = true;
    this.actionSheet.present();

  }

  public takePicture(sourceType) {
		// Create options for the Camera Dialog
		var options = {
			quality: 100,
			sourceType: sourceType,
			saveToPhotoAlbum: false,
			correctOrientation: true
		};
		// Get the data of an image
		this.camera.getPicture(options).then((imagePath) => {
			// Special handling for Android library
			if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
				this.filePath.resolveNativePath(imagePath)
				.then(filePath => {
					let correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
					let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
					this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
				});
			} 
			else {
				var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
				var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
				this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
			}		  
		}, (err) => {
			console.log('Error while selecting image')
			this.presentToast('Error while selecting image.');
		});
	}

	// Create a new name for the image
	private createFileName() {
		var d = new Date(),
		n = d.getTime(),
		newFileName = n + ".jpg";
		return newFileName;
	}

	// Copy the image to a local folder
	private copyFileToLocalDir(namePath, currentName, newFileName) {
		this.loading = this.loadingCtrl.create({
			content: 'copying file locally...',
		});
		this.loading.present();
		this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
			this.lastImage = newFileName;
			this.loading.dismiss();
			this.uploadImage();
		}, error => {
			console.log('Error while storing file.')
			this.loading.dismiss();
			this.presentToast('Error while storing file.');
		});
	}

	private presentToast(text) {
		let toast = this.toastCtrl.create({
			message: text,
			duration: 3000,
			position: 'top'
		});
		toast.present();
	}

	// Always get the accurate path to your apps folder
	public pathForImage(img) {
		if (img === null) {
			return '';
		} else {
			return cordova.file.dataDirectory + img;
		}
	}

	public on_progress = (progressEvent: ProgressEvent): void => {
		this.ng_zone.run(() => {
			if (progressEvent.lengthComputable) {
				let progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
				if (progress > 100) progress = 100;
				if (progress < 0) progress = 0;
				this.progress = progress;
			}
		});
	}

	public uploadImage() {
		console.log('uploadImage')
		// Destination URL
		var url = myVars.BASE_API_URL + "/retailers/Upload";

		// File for Upload
		var targetPath = this.pathForImage(this.lastImage);

		// File name only
		//var filename = this.lastImage;

		var userToken = this.localStorage.getToken();

		var options = {
			chunkedMode: false,
			fileKey: 'file',
			fileName: this.storedata._id + '.jpg',
			params: { token : userToken, sid : this.data._id }
		};

		const fileTransfer: TransferObject = this.transfer.create();

		this.loading = this.loadingCtrl.create({
			content: 'Uploading...',
			duration: 6000
		});
		this.loading.present();

		// Use the FileTransfer to upload the image
		fileTransfer.upload(targetPath, url, options).then(data => {
			let opp: any = JSON.parse(data.response)

			fileTransfer.onProgress(this.on_progress);

			this.loading.dismissAll()

			this.imageChanged = true;

      if(opp.success) {
        if (opp.success && this.addImageType == "profile") {
          this.data.profileImageUrl = opp.url;
        }
        else if (opp.success && this.addImageType == "instore") {
          if (this.data.storeImages == '') {
            this.data.storeImages = opp.url;
          }
          else {
            this.data.storeImages = this.data.storeImages + '$$$' + opp.url;
          }
        }
        this.UpdateStore();
      }
      else {
        this.presentToast('Error while uploading image.');
      }			
		}, err => {
			this.loading.dismissAll()
			this.presentToast('Error while uploading image.');
		});
	}

	chainIdAlert() {
		let alert = this.alertCtrl.create({
			title: 'Hi!',
			subTitle: 'If you own the chain of stores, please contact the customer care to create a unique ID for your business!',
			buttons: ['OK']
		});
		alert.present();
	}

	viewImage() {
		console.log('opening image')
		let loading = this.loadingCtrl.create({
			content: 'Please wait...',
			duration: 6000
		});

		loading.present();
		this.commonService.getImageUrl(0, this.profileImageUrl).then((data) => {
			loading.dismiss();
			if (data.success) {
				this.photoViewer.show(data.url, '', { share: false });
			}
		})
	}

	viewStoreImage(index: number) {
		console.log('opening image')
		let loading = this.loadingCtrl.create({
			content: 'Please wait...',
			duration: 6000
		});

		loading.present();
		this.commonService.getImageUrl(index, this.instoreArray[index]).then((data) => {
			loading.dismiss();
			if (data.success) {
				this.photoViewer.show(data.url, '', { share: false });
			}
		})
	}

	deleteImage(index:number) {
		let confirm = this.alertCtrl.create({
			subTitle: 'Selected image will be deleted permanently. Do you want to continue?',
			buttons: [
			{
				text: 'Cancel',
				handler: () => {
						//do nothing
					}
				},
				{
					text: 'Ok',
					handler: () => {
						var data = {
							storeId: this.storedata._id,
							url: this.instoreArray[index]
						}
						this.commonService.remStoreImg(data).subscribe((res) => {
							this.initializeData(res.data);
						})
					}
				}
				]
			});
		confirm.present();
	}

	loadMap() {

		try {
			if (this.CP.isOnline()) {
        this.lat = Number(this.data.loc.coordinates[0]);
        this.lng = Number(this.data.loc.coordinates[1]);

        let latLng = new google.maps.LatLng(this.lat, this.lng);

        let mapOptions = {
          center: latLng,
          draggable: false,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        console.log('map created')

        this.marker = new google.maps.Marker({
          map: this.map,
          animation: google.maps.Animation.DROP,
          icon: {
            url: "./assets/images/pin-pos.png"
          },
          position: latLng
        });
			}
			else {
				console.log('not online')
			}
		}
		catch (err) {
			console.log('err loading map')
		}
	};

	updateLoc(offer) {
		this.navCtrl.push(GmapEditPage, { lat: this.data.loc.coordinates[0], lng: this.data.loc.coordinates[1], parent: this })
	}

	locationChanged() {
		this.data.loc.coordinates[0] = this.localStorage.coordinates[0];
		this.data.loc.coordinates[1] = this.localStorage.coordinates[1];

    let pos = new google.maps.LatLng(this.data.loc.coordinates[0], this.data.loc.coordinates[1]);

		// create CameraPosition`
		let position = {
			target: pos,
			zoom: 15
		};

		// move the map's camera to position
    this.map.setCenter(position)
    this.marker.setPosition(new google.maps.LatLng(this.data.loc.coordinates[0], this.data.loc.coordinates[1]));

		this.updateRequired()
	}

	locationUnchanged() {
		console.log('unchanged')
		this.loadMap();
	}

}

@Component({
	template: `
	<ion-header>
	<ion-toolbar>
	<ion-title>
	Brands
	</ion-title>
	<ion-buttons start>
	<button ion-button (click)="dismiss()">
	<span ion-text>Close</span>
	</button>
	</ion-buttons>
	</ion-toolbar>
	</ion-header>

	<ion-content>
	<ion-searchbar [(ngModel)]="query" (ionInput)="getItems($event)" placeholder="Brand name"></ion-searchbar>
	<ion-list>
	<ion-item *ngIf="validQuery" (click)=close(query)>
	{{ query }}
	</ion-item>
	<ion-item *ngFor="let item of items" (click)=close(item)>
	{{ item }}
	</ion-item>
	</ion-list>	
	</ion-content>

	<ion-footer>
	<ion-toolbar>
	<div style="text-align: center; ">
	<ion-buttons>
	<button ion-button block (click)="dismiss()">
	<span>Close</span>
	</button>
	</ion-buttons> 
	</div>
	</ion-toolbar>
	</ion-footer>
	`
})

export class KeywordSearchPage {

	items = [];
	query = '';
	validQuery = false;

	constructor(public viewCtrl: ViewController,
		public navParams: NavParams,
		private commonService: CommonService) {
	}

	close(item: any) {
		this.viewCtrl.dismiss(item);
	}

	dismiss() {
		this.viewCtrl.dismiss(null);
	}

	getItems(ev: any) {
		// Reset items back to all of the items
		this.items = [];
		this.validQuery = false;
		// set val to the value of the searchbar
		let val = ev.target.value;
		this.query = val;

		// if the value is an empty string don't filter the items
		if (val && val.trim() != '') {
			this.validQuery = true;
			this.items = this.commonService.searchKeywords(val);
		}
	}
}