import { Component } from '@angular/core';
import { ViewController, NavParams, AlertController } from 'ionic-angular';

@Component({
  selector: 'page-pin-screen',
  templateUrl: 'pin-screen.html',
})
export class PinScreenPage {

  pinString = '';
  confirmPin = '';
  emptyBtns = [1,1,1,1];
  fullBtns = [];
  enterText = 'Enter';
  newPin = true;

  constructor(public viewCtrl: ViewController, 
    public alertCtrl: AlertController,
    public navParams: NavParams) {
    this.newPin = this.navParams.data.newpin;
  }

  dismmiss() {
    if(this.pinString.length == 4) {
      this.viewCtrl.dismiss(this.pinString)
    }
    else {
      this.viewCtrl.dismiss(null)
    }    
  }

  add(str) {
    if(this.pinString.length < 4) {
      this.fullBtns.push(1)
      this.emptyBtns.pop()
      this.pinString = this.pinString + str;
      if (this.pinString.length == 4) {
        if(this.confirmPin == this.pinString) {
          this.viewCtrl.dismiss(this.pinString)
        }
        else if (this.confirmPin == '') {
          if (!this.newPin) {
            this.viewCtrl.dismiss(this.pinString)
          }
          setTimeout(()=>{
            this.confirmPin = this.pinString;
            this.pinString = '';
            this.enterText = "Confirm"
            this.fullBtns = []
            this.emptyBtns = [1, 1, 1, 1];
          }, 400)          
        }
        else {
          var helpAlert = this.alertCtrl.create({
            subTitle: 'PIN did not match',
            buttons: ['Ok']
          });
          helpAlert.onDidDismiss(data=>{
            this.confirmPin = '';
            this.pinString = '';
            this.enterText = "Enter"
            this.fullBtns = []
            this.emptyBtns = [1, 1, 1, 1];
          })
          helpAlert.present();
        }
        
      }
    }
  }

}
