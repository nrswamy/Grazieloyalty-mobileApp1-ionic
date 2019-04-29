import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { LocalstorageProvider } from './localstorage/localstorage'

import 'rxjs/add/operator/toPromise';
import * as myVars from '../config';

@Injectable()
export class StoreService {
	private baseUrl = myVars.BASE_API_URL + '/stores';
	private userToken :any;
	private safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': this.userToken});


	constructor(private http: Http, private localStorage: LocalstorageProvider) { 
		
	}	
	
	addStore(data: any) {		
		const url = `${this.baseUrl}`;
		var userToken = this.localStorage.getToken()
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.post(url, data, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	updateStore(data: any) {
		const url = `${this.baseUrl}/mystore/${data._id}`;
		var userToken = this.localStorage.getToken()
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
		.put(url, data, { headers: this.safeHeader })
		.map((response: Response) => response.json())
		.catch(this.handleError);

	}

	getStore(storeId: any) {
		const url = `${this.baseUrl}/mystore/${storeId}`;
		var userToken = this.localStorage.getToken();
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.get(url, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	addOffer(data: any) {
		const url = `${this.baseUrl}/addOffer`;
		var userToken = this.localStorage.getToken()
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.put(url, data, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	removeOffer(data: any) {
		const url = `${this.baseUrl}/removeOffer`;
		var userToken = this.localStorage.getToken()
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.put(url, data, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	addItem(data: any) {
		const url = `${this.baseUrl}/addItem`;
		console.log(data)
		var userToken = this.localStorage.getToken()
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.put(url, data, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	removeItem(data: any) {
		const url = `${this.baseUrl}/removeItem`;
		var userToken = this.localStorage.getToken()
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.put(url, data, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	updateItem(data: any) {
		const url = `${this.baseUrl}/updateItem`;
		var userToken = this.localStorage.getToken()
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.put(url, data, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	getItems(storeId) {
		const url = `${this.baseUrl}/getItems/${storeId}`;
		var userToken = this.localStorage.getToken()
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.get(url, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	getStoreMeta(index, storeId) {
		const url = `${this.baseUrl}/storeRating`;
		var data = { index: index, storeId: storeId };
		var userToken = this.localStorage.getToken()
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.post(url, data, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError)
			.toPromise();
	}

	getStoreUserCount(index, storeId) {
		const url = `${this.baseUrl}/storeUserCount`;
		var data = { index: index, storeId: storeId };
		var userToken = this.localStorage.getToken()
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.post(url, data, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError)
			.toPromise();
	}

	verifyRef(code) {
		const url = `${this.baseUrl}/isValidReferral/${code}`;
		var userToken = this.localStorage.getToken()
		this.safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.get(url, { headers: this.safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	getDashboardInfo(data: any) {
		const url = `${this.baseUrl}/dashboard`;
		var userToken = this.localStorage.getToken();

		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });

		return this.http
			.get(url, { headers: safeHeader, params: data })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	getSalesChartInfo(data: any) {
		const url = `${this.baseUrl}/saleschart`;
		var userToken = this.localStorage.getToken();

		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });

		return this.http
			.get(url, { headers: safeHeader, params: data })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

  getRecentSales(sid:string) {
    const url = `${this.baseUrl}/getRecentSales/${sid}`;
    var userToken = this.localStorage.getToken();
    var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
    return this.http
      .get(url, { headers: safeHeader })
      .toPromise()
      .then((response: Response) => response.json())
      .catch(this.handleError);
  }

	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Promise.reject(error.message || error);
	}

}