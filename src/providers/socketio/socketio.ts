import { Headers, Http, Response } from '@angular/http';
import { Injectable, NgZone } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import * as myVars from '../../config';
/*
  Generated class for the SocketioProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SocketioProvider {

  messages = [];
  socketHost = myVars.BASE_API_URL;
  socketId = ''
  zone = new NgZone({ enableLongStackTrace: false });

  constructor(public http: Http, 
    public toastCtrl: ToastController,
    private socket: Socket) {

  }

  connectServer() {
    this.socket.connect();
    this.socket.on('conmessage', (data) => {
      this.socketId = data.sid;
    });
  }

  disconnectServer() {
    this.socket.disconnect();
  }

  getPayMessages() {
    let observable = new Observable(observer => {
      this.socket.on('paymessage', (data) => {
        observer.next(data)
        if (data == "success") {
          let toast = this.toastCtrl.create({
            message: 'Your payment was successfull.',
            duration: 2000,
            position: 'top',
            showCloseButton: true,
            closeButtonText: 'Ok',
            cssClass: 'my-toast'
          });
          toast.present();
        }
        else {
          let toast = this.toastCtrl.create({
            message: 'Your payment was unsuccessfull.',
            duration: 2000,
            position: 'top',
            showCloseButton: true,
            closeButtonText: 'Ok',
            cssClass: 'my-toast'
          });
          toast.present();
        }
      });
    })
    return observable;
  }

  getId() {
    return this.socketId;
  }

}
