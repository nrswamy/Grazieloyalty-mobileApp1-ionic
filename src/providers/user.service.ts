import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import 'rxjs/Rx';
import * as myVars from '../config';

@Injectable()
export class UserService {
    constructor(private http: Http) { }

    private baseUrl = myVars.BASE_API_URL + '/users'; 
    public dat: any;

    public getUserInfo(mobile: string) { 
        const url = `${this.baseUrl}/getInfo/${mobile}`;
        return this.http.get(url)
            .map((response: Response) => response.json())
            .catch(this.handleError);
    }    


    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

}