import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'; 
import { Storage } from '@ionic/storage';
/*
  Generated class for the LocalstorageProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
  	*/
  @Injectable()
  export class LocalstorageProvider {

  	public userToken;
  	public pages: any[];
    public isRootPage = false;
    public fromStoreEdit = false;
    public coordinates = [20.593684, 78.96288];

    constructor(public http: Http, 
      private storage: Storage) {
      if (this.storage.ready()) {
        this.storage.get('token').then((token) => {
          this.userToken = token;
        })
      }

      this.pages = [
      { title: 'Dashboard', visible: true }, 
      { title: 'Store Manager', visible: true }, 
      { title: 'Settle Balance', visible: false },
      { title: 'Sales History', visible: false },
      { title: 'My Payments', visible: true },
      { title: 'My Customer', visible: true },
      { title: 'Customer Feedbacks', visible: false },
      { title: 'My Account', visible: true }, 
      { title: 'Contact', visible: true }
      ];
    }

    isReady() {
      return this.storage.ready();
    }

    setToken(userToken: any) {
      this.storage.set('token', userToken);
      this.userToken = userToken;
    }


    getToken(){
      return this.userToken;	
    }


    setItem(key: string, val: any) {
      this.storage.set(key, val);
    }


    getItem(key: string):Promise<any> {
      return this.storage.get(key).then(data => {
        if(key === 'token')
          {this.userToken = data;}
        return data;
      });
    }


    clearStorage() {
      this.storage.clear().then(() => {
        console.log('all keys are cleared');
      });
    }
  }
