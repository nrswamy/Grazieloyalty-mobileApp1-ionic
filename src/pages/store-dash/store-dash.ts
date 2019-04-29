import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { LocalstorageProvider } from '../../providers/localstorage/localstorage';
import { StoreService } from '../../providers/index'
import { DatePipe } from '@angular/common';
import { LoadingController } from 'ionic-angular';
import { SaleshistoryPage } from '../saleshistory/saleshistory'
import { Chart } from 'chart.js';

@Component({
  selector: 'page-store-dash',
  templateUrl: 'store-dash.html',
})
export class StoreDashPage {
	@ViewChild('TransactioHistory') TransactioHistory;
	@ViewChild('BusinessHistory') BusinessHistory;

	storeData: any;
	storeName = '';
	loader: any;
	loaderCount = 0;
	userData: any;
	userId: any = '';
	valid = false;
	fromDate: string;
	toDate: string;
	currentDate: any;
	curString: '';
	dateString = '';
	setToday = true;
	maxDate: any;
	minDate: any;
	urlString: any;
	firstChart: any;
	secondChart: any;
	transData = [];
	transLabel = [];
	salesData = [];
	salesLabel = [];
	dashData = {
		'newcustomers': 0,
		'returncustomers': 0,
		'alltransactions': 0,
		'totalamount': 0
	}
	sales: any;

	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		private localStorage: LocalstorageProvider,
		private store: StoreService,
		private datePipe: DatePipe,
		private loading: LoadingController) {
		this.storeData = this.navParams.data;
		this.storeName = this.storeData.name;
		this.onStart();
  }

  ionViewCanEnter() {
    this.localStorage.pages[2].visible = true;
    this.localStorage.pages[3].visible = true;
    this.localStorage.pages[6].visible = true;
  }

  ionViewCanLeave() {
    this.localStorage.pages[2].visible = false;
    this.localStorage.pages[3].visible = false;
    this.localStorage.pages[6].visible = false;
  }

	ionViewDidLoad() {

		this.firstChart = new Chart(this.TransactioHistory.nativeElement, {

			type: 'line',
			data: {
				labels: this.transLabel,
				datasets: [
					{
						label: "Number of sales",
						fill: false,
						lineTension: 0.1,
						backgroundColor: "rgba(255, 51, 51,0.4)",
						borderColor: "rgba(230, 0, 0,1)",
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						pointBorderColor: "rgba(75,192,192,1)",
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 5,
						pointHoverBackgroundColor: "rgba(75,192,192,1)",
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 1,
						pointHitRadius: 10,
						data: this.transData,
						spanGaps: false,
					}
				]
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							// Include a dollar sign in the ticks
							callback: function(value, index, values) {
								if (value < 1000) {
									return value
								}
								else if (value < 100000) {
									var temp = value / 1000;
									return temp + 'K';
								}
								else {
									var temp = value / 100000;
									return temp + 'L';
								}
							}
						}
					}]
				}
			}

		});

		this.secondChart = new Chart(this.BusinessHistory.nativeElement, {

			type: 'line',
			data: {
				labels: this.salesLabel,
				datasets: [
					{
						label: "Sales in Rupees",
						fill: false,
						lineTension: 0.1,
						backgroundColor: "rgba(255, 51, 51,0.4)",
						borderColor: "rgba(230, 0, 0,1)",
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						pointBorderColor: "rgba(75,192,192,1)",
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 5,
						pointHoverBackgroundColor: "rgba(75,192,192,1)",
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 1,
						pointHitRadius: 10,
						data: this.salesData,
						spanGaps: false,
					}
				]
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							// Include a dollar sign in the ticks
							callback: function(value, index, values) {
								if (value < 1000) {
									return value
								}
								else if (value < 100000) {
									var temp = value / 1000;
									return temp + 'K';
								}
								else {
									var temp = value / 100000;
									return temp + 'L';
								}
							}
						}
					}]
				}
			}

		});

	}

  openSalesHistory() {
    this.navCtrl.push(SaleshistoryPage)
  }

  onStart() {
		var d = new Date();
		var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
		this.currentDate = new Date(utc);
		this.toDate = this.currentDate.toISOString();
		this.maxDate = this.datePipe.transform(this.currentDate, 'yyyy-MM-dd');

		var dateString = (new Date(this.currentDate)).toISOString().substring(0, 10);
		var startDateTS = new Date(`${dateString}T00:00:00.000Z`).valueOf();
		let fromDayFromWeek = startDateTS - (3600000 * 24 * 7)
		let utc2 = fromDayFromWeek;
		let lastweek = new Date(utc2);
		this.fromDate = lastweek.toISOString();
		dateString = (new Date(this.currentDate)).toISOString().substring(0, 10);
		var endDateTS = new Date(`${dateString}T23:59:59.999Z`).valueOf();

		this.urlString = {
			'fromDate': fromDayFromWeek,
			'toDate': endDateTS,
			'sid': this.storeData._id
		}

		this.localStorage.getItem('token').then((data) => {

			this.incrementLoader()

			this.store.getDashboardInfo(this.urlString).subscribe(
				data => {
					if (data) {
						let val = data.trans;
						this.dashData.newcustomers = val.new;
						this.dashData.returncustomers = val.return;
						this.dashData.alltransactions = val.trans;
						this.dashData.totalamount = Number(val.bills.toFixed(0));
					}
					this.decrementLoader()
				},
				error => {
					console.log(error)
					this.decrementLoader()
				}
			)

			this.incrementLoader()
			this.store.getSalesChartInfo(this.urlString).subscribe(
				data => {
					if (data) {
						this.verifyDate();
					}
					this.decrementLoader()
				},
				error => {
					console.log(error)
					this.decrementLoader()
				}
			)

			this.localStorage.getItem('userData').then((data) => {
				if (data) {
					this.valid = true;
					this.userId = data.sid;
				}
				this.decrementLoader()
			})
		},
			(error) => {
				this.decrementLoader()
				console.log(error)
			})
  }

	incrementLoader() {
		if (!this.loaderCount) {
			this.loader = this.loading.create({
				content: "Please wait...",
				duration: 5000
			});
			this.loader.present();
		}
		this.loaderCount++;
	}

	decrementLoader() {
		this.loaderCount--;
		if (!this.loaderCount) {
			this.loader.dismiss();
		}
	}

	verifyDate() {
		let d1 = new Date(this.fromDate)
		this.setToday = true;
		if (d1.getFullYear() < this.currentDate.getFullYear()) {
			this.setToday = false;
		}
		else if (d1.getMonth() < this.currentDate.getMonth()) {
			this.setToday = false;
		}
		else if (d1.getDate() < this.currentDate.getDate()) {
			this.setToday = false;
		}

		this.transData = [];
		this.transLabel = [];
		this.salesData = [];
		this.salesLabel = [];

		var dateString = (new Date(this.fromDate)).toISOString().substring(0, 10);
		var startDateTS = new Date(`${dateString}T00:00:00.000Z`).valueOf();
		dateString = (new Date(this.toDate)).toISOString().substring(0, 10);
		var endDateTS = new Date(`${dateString}T23:59:59.999Z`).valueOf();

		this.urlString = {
			'fromDate': startDateTS,
			'toDate': endDateTS,
			'sid': this.storeData._id
		}
		this.incrementLoader()
		this.store.getDashboardInfo(this.urlString).subscribe(
			data => {

				if (data) {
					let val = data.trans;
					this.dashData.newcustomers = val.new;
					this.dashData.returncustomers = val.return;
					this.dashData.alltransactions = val.trans;
					this.dashData.totalamount = Number(val.bills.toFixed(0));
				}
				this.decrementLoader()
			},
			error => {
				console.log(error)
				this.decrementLoader()
			}
		)

		this.incrementLoader()
		this.store.getSalesChartInfo(this.urlString).subscribe(
			data => {


				if (data) {
					let stats = data.trans;
					if (stats) {
						for (var i = 0; i < stats.length; i++) {
							let label = stats[i]._id.day.substring(5, 10)
							this.transLabel.push(label)

							this.salesLabel.push(label)
							this.transData.push(stats[i].totalSales)
							this.salesData.push(stats[i].totalValue)
						}
					}

					this.firstChart.data.labels = this.transLabel;
					this.firstChart.data.datasets[0].data = this.transData;
					this.secondChart.data.labels = this.salesLabel;
					this.secondChart.data.datasets[0].data = this.salesData;

					this.firstChart.update()
					this.secondChart.update()
				}
				this.decrementLoader()
			},
			error => {
				console.log(error)
				this.decrementLoader()
			}
		)

	}

}
