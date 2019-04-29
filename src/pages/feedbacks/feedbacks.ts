import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { RetailerService } from '../../providers/index'
import { LocalstorageProvider } from '../../providers/localstorage/localstorage'

@Component({
  selector: 'page-feedbacks',
  templateUrl: 'feedbacks.html',
})
export class FeedbacksPage {

  comments = []

  constructor(public navCtrl: NavController, 
    private retailers: RetailerService,
    private localStorage: LocalstorageProvider,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.localStorage.getItem('currentStore').then(data=>{
      try {
        if (data && data.name) {
          this.retailers.getComments(data._id).then(response=>{
            if(response && response.success) {
              this.comments = response.result;
              for (var i = this.comments.length - 1; i >= 0; i--) {
                let str = this.comments[i].userMobile;
                this.comments[i].userMobile = '******' + str.substr(str.length - 4);
              }
            }
          })
        }
      }
      catch(e) {
        console.log('error=> ' + e)
      }      
    })    
  }

}
