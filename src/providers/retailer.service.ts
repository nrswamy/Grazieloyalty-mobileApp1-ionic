import { Injectable }    	from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { LocalstorageProvider } from './localstorage/localstorage'
import 'rxjs/add/operator/toPromise';
import 'rxjs/Rx';
import * as myVars from '../config';

@Injectable()
export class RetailerService { 
	constructor(private http: Http,
		private localStorage: LocalstorageProvider) { }

	private baseUrl = myVars.BASE_API_URL + '/retailers';

	private loginHeader = new Headers({ 'Content-Type': 'application/json' });

	register(data: any) {
		const url = `${this.baseUrl}/register`;
		return this.http.post(url, data, { headers: this.loginHeader })
			.map((response: Response) => {
				response.json();
			});
	}

	getLocation(url: string) {
		return this.http.get(url)
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	getCity(zip: number) {
		const url = `${this.baseUrl}/location/${zip}`;
		return this.http.get(url)
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}


	getRetailers(): Promise<any> {
		return this.http.get(this.baseUrl)
		.toPromise()
		.then(response => response.json())
		.catch(this.handleError);
	}

  customerHistory(data) {
    const url = `${this.baseUrl}/customerHist`;
    var userToken = this.localStorage.getToken();
    var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
    return this.http.post(url, data, { headers: safeHeader })
      .map((response: Response) => response.json())
      .toPromise()
      .catch(this.handleError);
  }

	searchRetailerbyUN(name: String) {
		
		const url = `${this.baseUrl}/searchun/${name}`;
		return this.http.get(url, { headers: this.loginHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError).toPromise();
	}

	searchRetailerbyMob(mobile: String) {
		const url = `${this.baseUrl}/searchum/${mobile}`;
		return this.http.get(url, { headers: this.loginHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError).toPromise();
	}

	searchRetailerbyEmail(email: String) {
		const url = `${this.baseUrl}/searchue/${email}`;
		return this.http.get(url, { headers: this.loginHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError).toPromise();
	}

	createStore(data: any) {
		const url = `${this.baseUrl}/createStore`;
		var userToken = this.localStorage.getToken();
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.post(url, data, { headers: safeHeader })
	}

	addSale(data: any) {
		const url = `${this.baseUrl}/transfer`;
		var userToken = this.localStorage.getToken();
		//console.log(url)
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http.post(url, data, { headers: safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	settleCustomer(data: any) {
		const url = `${this.baseUrl}/settle`;
		var userToken = this.localStorage.getToken();
		//console.log(url)
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http.post(url, data, { headers: safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	getStores() {
		const url = `${this.baseUrl}/stores`;
		var userToken = this.localStorage.getToken();
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.get(url, { headers: safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	getStatData() {
		const url = `${this.baseUrl}/stats`;
		var userToken = this.localStorage.getToken();
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.get(url, { headers: safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	getRewardUser(mobile:string) {
		const url = `${this.baseUrl}/reward/${mobile}`;	
		var userToken = this.localStorage.getToken();
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.get(url, { headers: safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	getDashboardInfo(data:any) {		
		const url = `${this.baseUrl}/dashboard`;
		var userToken = this.localStorage.getToken();
		
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });		

		return this.http
			.get(url, { headers: safeHeader, params: data })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	getSalesChartInfo(data:any) {
		const url = `${this.baseUrl}/saleschart`;
		var userToken = this.localStorage.getToken();

		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });

		return this.http
			.get(url, { headers: safeHeader, params: data })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	wait(ms) {
		var start = new Date().getTime();
		var end = start;
		while (end < start + ms) {
			end = new Date().getTime();
		}
		console.log('asfdg')
	}

	verifyAndSave(data:any) {
		const url = `${this.baseUrl}/verifyAndRegister`;
		return this.http.post(url, data, { headers: this.loginHeader })
			.toPromise()
			.then(response => response.json())
			.catch(this.handleError);
	}

	searchUser(mobile: string) {
		const url = `${this.baseUrl}/searchUser/${mobile}`;
		var userToken = this.localStorage.getToken();
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });	
		return this.http.get(url, { headers: safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	verfiyToken(uuid:string) {
		const url = `${this.baseUrl}/verifyToken/${uuid}`;
		var userToken = this.localStorage.getToken();

		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http.get(url, { headers: safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

	validateApp() {
		const url = `${this.baseUrl}/validateApp`;
		return this.http.get(url, { headers: this.loginHeader })
			.map((response: Response) => response.json())
			.toPromise()
			.catch(this.handleError);
	}

	getRetailerInfo() {
		const url = `${this.baseUrl}/getRetailerInfo`;
		var userToken = this.localStorage.getToken();
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http.get(url, { headers: safeHeader })
			.map((response: Response) => response.json())
			.catch(this.handleError);
	}

  getOfferCount() {
    const url = `${this.baseUrl}/getOfferCount`;
    var userToken = this.localStorage.getToken();
    var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
    return this.http.get(url, { headers: safeHeader })
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

	updateProfileName(data) {
		const url = `${this.baseUrl}/updateName`;
		var userToken = this.localStorage.getToken();
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http.post(url, data, { headers: safeHeader })
			.toPromise()
			.then(response => response.json())
			.catch(this.handleError);
	}

  updatePack(data) {
    const url = `${this.baseUrl}/updatePack`;
    var userToken = this.localStorage.getToken();
    var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
    return this.http.post(url, data, { headers: safeHeader })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

	updateProfileEmail(data) {
		const url = `${this.baseUrl}/updateEmail`;
		var userToken = this.localStorage.getToken();
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http.post(url, data, { headers: safeHeader })
			.toPromise()
			.then(response => response.json())
			.catch(this.handleError);
	}

	updateProfileMobile(data) {
		const url = `${this.baseUrl}/updateMobile`;
		var userToken = this.localStorage.getToken();
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http.post(url, data, { headers: safeHeader })
			.toPromise()
			.then(response => response.json())
			.catch(this.handleError);
	}

	VerifyOtp(data: any) {
		const url = `${this.baseUrl}/verifyotp`;
		var userToken = this.localStorage.getToken();
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.post(url, data, { headers: safeHeader })
			.toPromise()
			.then((response: Response) => response.json())
			.catch(this.handleError);
	}

	VerifyPw(data: any) {
		const url = `${this.baseUrl}/verifywithpw`;
		var userToken = this.localStorage.getToken();
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.post(url, data, { headers: safeHeader })
			.toPromise()
			.then((response: Response) => response.json())
			.catch(this.handleError);
	}

	updatepw(data: any) {
		const url = `${this.baseUrl}/updatepw`;
		var userToken = this.localStorage.getToken();
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.post(url, data, { headers: safeHeader })
			.toPromise()
			.then((response: Response) => response.json())
			.catch(this.handleError);
	}

	createPaymentUrl(data:any) {
		const url = `${this.baseUrl}/paymentRequest`;
		var userToken = this.localStorage.getToken();
		var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
		return this.http
			.post(url, data, { headers: safeHeader })
			.toPromise()
			.then((response: Response) => response.json())
			.catch(this.handleError);
	}

  getPayments() {
    const url = `${this.baseUrl}/getRecentPayments`;
    var userToken = this.localStorage.getToken();
    var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
    return this.http
      .get(url, { headers: safeHeader })
      .toPromise()
      .then((response: Response) => response.json())
      .catch(this.handleError);
  }

  getComments(sid:string) {
    const url = `${this.baseUrl}/getComments/${sid}`;
    var userToken = this.localStorage.getToken();
    var safeHeader = new Headers({ 'Content-Type': 'application/json', 'x-access-token': userToken });
    return this.http
      .get(url, { headers: safeHeader })
      .toPromise()
      .then((response: Response) => response.json())
      .catch(this.handleError);
  }

  getTrans(tid) {
    const url = `${this.baseUrl}/getTransaction/${tid}`;
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