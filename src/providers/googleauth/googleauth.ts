import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { GooglePlus } from '@ionic-native/google-plus';
import { AlertController } from 'ionic-angular';
import * as myVars from '../../config';

/*
  Generated class for the GoogleauthProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
  	*/
  @Injectable()
  export class GoogleauthProvider {

  	private baseUrl = myVars.BASE_API_URL + '/retailers';
  	private loginHeader = new Headers({ 'Content-Type': 'application/json' });

  	constructor(public http: Http,
  		public alertCtrl: AlertController,
  		private googlePlus: GooglePlus) {
  	}

  	login() {
  		console.log('login')
  		var ret:any = {};
  		ret.exist = false;
  		ret.err = null;

      return new Promise<any>((resolve, reject) => {
        this.googlePlus.login({}).then((user) => {
          resolve(user);
        }).catch((err) => {
          console.log(err)
          reject(err)
        })
      });  
    }

    verifyUser(data: any) {
      const url = `${this.baseUrl}/searchue`;
      return this.http.post(url, data, { headers: this.loginHeader })
      .map((response: Response) => response.json())
      .catch(this.handleError).toPromise();
    }

    logging(str: any) {
      const url = `${this.baseUrl}/logging`;
      this.http.post(url, {data: str}, { headers: this.loginHeader });
    }

    logout() {
      return new Promise<any>((resolve, reject) => {
        this.googlePlus.logout().then((user) => {
          resolve(user);
        }).catch((err)=>{
          console.log(err)
          reject(err)
        })
      }); 
    }

    private handleError(error: any): Promise<any> {
  		console.error('An error occurred', error); // for demo purposes only
  		return Promise.reject(error.message || error);
  	}

  }
