import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';

@Injectable()
export class ValidationService {

	static emailValidator(control: FormControl) {
		// RFC 2822 compliant regex
		if(control.value) {
			let EMAIL_REGEXP = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/	;

			return EMAIL_REGEXP.test(control.value) ? null : {
				"invalidEmail": true
			};
		};
		return null;
	}

	static mobileValidator(control: FormControl) {
		// RFC 2822 compliant regex
		if (control.value) {
			let PHONE_REGEXP = /^[789]\d{9}$/;

			return PHONE_REGEXP.test(control.value) ? null : {
				"invalidNumber": true
			};
		};
		return null;
	}

	static usernameValidator(control: FormControl) {
		// RFC 2822 compliant regex
		if (control.value) {
			let USERNAME_REGEXP = /^\S*$/;

			return USERNAME_REGEXP.test(control.value) ? null : {
				"invalidUsername": true
			};
		};
		return null;
	}
	

	static passwordValidator(control: FormControl) {
		// {6,100}           - Assert password is between 6 and 100 characters
		// (?=.*[0-9])       - Assert a string has at least one number
		if (control.value.match(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,100}$/)) {
			return null;
		} else {
			return { 'invalidPassword': true };
		}
	}
}