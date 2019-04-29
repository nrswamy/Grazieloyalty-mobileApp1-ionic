import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/add/operator/map'
import * as myVars from '../config';

@Injectable()
export class AuthenticationService {
    constructor(private http: Http) { }
    private baseUrl = myVars.BASE_API_URL + '/retailers';
    private headers = new Headers({ 'Content-Type': 'application/json' });

    loginRetailer(username: string, password: string, uuid: string) {
        const url = `${this.baseUrl}/loginM`;
        return this.http.post(url, JSON.stringify({ mobile_no: username, password: password, deviceId: uuid }), { headers: this.headers })
            .map((response: Response) => response.json())
			.catch(this.handleError);
    }

    loginRetailerWithOTP(data:any) {
		const url = `${this.baseUrl}/loginWithOtp`;
		return this.http.post(url, data, { headers: this.headers })
			.toPromise()
			.then((response: Response) => response.json())
			.catch(this.handleError);
    }

	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Promise.reject(error.message || error);
	}
}