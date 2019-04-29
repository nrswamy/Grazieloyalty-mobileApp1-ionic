import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { LocalstorageProvider } from './localstorage/localstorage'

import 'rxjs/add/operator/toPromise';
import * as myVars from '../config';

@Injectable()
export class CommonService {
	private baseUrl = myVars.BASE_API_URL + '/common';
	private userToken = this.localStorage.getToken();
	private safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': this.userToken });
	public keywords = [];

	constructor(private http: Http,
		private localStorage: LocalstorageProvider) {
	}


	updateKeywords(data: any) {
		const url = `${this.baseUrl}/keywords`;
		this.userToken = this.localStorage.getToken();
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': this.userToken });
		return this.http
			.put(url, data, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);

	}

	getKeywords() {
		const url = `${this.baseUrl}/meta`;
		this.userToken = this.localStorage.getToken();
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': this.userToken });
		return this.http
			.get(url, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

  searchAddr(query: string): Promise<any> {
    const url = `${this.baseUrl}/autoaddress/${query}`;
    this.safeHeader = new Headers({ 'Content-Type': 'application/json' });
    return this.http
      .get(url, { headers: this.safeHeader })
      .map((response: Response) => response.json())
      .toPromise()
      .catch(this.handleError);
  }

	setKeywords(keys: any) {
		this.keywords = keys;
		console.log(this.keywords)
	}

	searchKeywords(query: string) {
		let filtered = [];
		let length = this.keywords.length;
		if(!length) {
			return filtered;
		}
		for (var i = 0; i < this.keywords.length; i++) {
			if (this.keywords[i].toLowerCase().indexOf(query.toLowerCase()) !== -1) {
				filtered.push(this.keywords[i])
			}
		}
		return filtered;
	}

	generateOTP(mobile: string) {
		console.log('generateOTP')
		const url = `${this.baseUrl}/genOTP/${mobile}`;
		this.safeHeader = new Headers({ 'Content-Type': 'application/json' });
		return this.http
			.get(url, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	public searchUser(mobile: string) {
		const url = `${this.baseUrl}/searchUser/${mobile}`;
		return this.http.get(url)
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Promise.reject(error.message || error);
	}

	getImageUrl(index: number, imgUrl: string): Promise<any> {
		var data = { index: index, url: imgUrl };
		const url = `${this.baseUrl}/getImageUrl`;
		this.safeHeader = new Headers({ 'Content-Type': 'application/json' });
		return this.http
			.post(url, data, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError).toPromise();
	}

	getImageThumbUrl(index:number, imgUrl: string): Promise<any> {
		var data = { index: index, url: imgUrl };
		const url = `${this.baseUrl}/getImageThumbUrl`;
		this.safeHeader = new Headers({ 'Content-Type': 'application/json' });
		return this.http
			.post(url, data, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError).toPromise();
	}

	remProfImg(data: any) {
		const url = `${this.baseUrl}/remProfImg`;
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': this.userToken });
		return this.http
			.post(url, data, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	remStoreImg(data: any) {
		const url = `${this.baseUrl}/remStoreImg`;
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': this.userToken });
		return this.http
			.post(url, data, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	searchCity(query: string) {
		const url = `${this.baseUrl}/auto/${query}`;
		this.safeHeader = new Headers({ 'Content-Type': 'application/json' });
		return this.http
			.get(url, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	sendMessage(data:any) {
		const url = `${this.baseUrl}/sendmsg`;
		this.safeHeader = new Headers({ 'Content-Type': 'application/json' });
		return this.http
			.post(url, data, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	getVersionInfo() {
		const url = `${this.baseUrl}/getCurVersion`;
		this.safeHeader = new Headers({ 'Content-Type': 'application/json' });
		return this.http
			.get(url, { headers: this.safeHeader })			
			.map((response: Response) => response.json())
			.catch(this.handleError).toPromise();
	}

  getPackDetails() {
    const url = `${this.baseUrl}/getRechargePacks`;
    this.safeHeader = new Headers({ 'Content-Type': 'application/json' });
    return this.http
      .get(url, { headers: this.safeHeader })
      .map((response: Response) => response.json())
      .catch(this.handleError).toPromise();
  }

  getTopups() {
    const url = `${this.baseUrl}/getTopupPacks`;
    this.safeHeader = new Headers({ 'Content-Type': 'application/json' });
    return this.http
      .get(url, { headers: this.safeHeader })
      .map((response: Response) => response.json())
      .catch(this.handleError).toPromise();
  }

  verifyUserPin(data:any) {
    const url = `${this.baseUrl}/verifyUserPin`;
    this.safeHeader = new Headers({ 'Content-Type': 'application/json' });
    return this.http
      .post(url, data, { headers: this.safeHeader })
      .map((response: Response) => response.json())
      .catch(this.handleError).toPromise();
  }

  verifyUserOtp(data: any) {
    const url = `${this.baseUrl}/verifyUserOtp`;
    this.safeHeader = new Headers({ 'Content-Type': 'application/json' });
    return this.http
      .post(url, data, { headers: this.safeHeader })
      .map((response: Response) => response.json())
      .catch(this.handleError).toPromise();
  }

  verifyUserQr(data: any) {
    const url = `${this.baseUrl}/verifyUserQr`;
    this.safeHeader = new Headers({ 'Content-Type': 'application/json' });
    return this.http
      .post(url, data, { headers: this.safeHeader })
      .map((response: Response) => response.json())
      .catch(this.handleError).toPromise();
  }
}