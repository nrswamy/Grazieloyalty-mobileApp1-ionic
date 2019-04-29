import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { Platform } from 'ionic-angular';

@Injectable()
export class ConnectivityProvider {

	onDevice: boolean;

	constructor(public platform: Platform, public network: Network) {
		this.onDevice = this.platform.is('cordova');
	}

	isOnline(): boolean {
    console.log('isOnline')
		if (this.onDevice && this.network.type) {
			return this.network.type !== 'none';
		} else {
			return navigator.onLine;
		}
	}

	isOffline(): boolean {
		if (this.onDevice && this.network.type) {
			return this.network.type === 'none';
		} else {
			return !navigator.onLine;
		}
	}
}