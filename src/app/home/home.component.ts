import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import * as $ from 'jquery'
import {
  TweenMax,
  Circ,
  Power4
} from 'gsap'
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { HttpClient } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts/ng2-charts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  nextRoute = 'transactions';
  totalBudget = this.cashify(0)
  totalIncome = this.cashify(0)
  totalExpenses = this.cashify(0)
  chartInfo = [
    { data: [0, 0, 0, 0, 0, 0, 0], label: 'Ingresos' },
    { data: [0, 0, 0, 0, 0, 0, 0], label: 'Gastos' }
  ];

  chartLabels = ['Sep 10', 'Sep 11', 'Sep 12', 'Sep 13', 'Sep 14', 'Sep 15', 'Sep 16'];
  constructor(private router: Router, public afAuth: AngularFireAuth, private http: HttpClient) { }
  routeToGo() {
    TweenMax.to('.login-container', 1, {
      y: '-500vh', ease: Power4.easeIn, onComplete: () => {
        $('.transactions-router').click()
      }
    })
  }
  ngOnInit() {
    TweenMax.staggerFrom('.idunno', 1, { x: '-500vw', ease: Power4.easeOut }, 0.2)
    this.http.get('http://localhost:5005/getTableInfo').subscribe((data) => {
      this.totalBudget = this.cashify(data["data"]["total"])
      this.totalIncome = this.cashify(data["data"]["incomes"])
      this.totalExpenses = this.cashify(data["data"]["expenses"])
    })
    this.http.get('http://localhost:5005/getChartData').subscribe((data) => {
      this.lineChartLabels = data["data"]["dates"]
      this.lineChartData = [
        { data: data["data"]["incomes"], label: "Ingresos" },
        { data: data["data"]["expenses"], label: "Gastos" }
      ]

      this.lineChartLabels = data["data"]["dates"]
    })

  }
  cashify(amountIn) {

    let amount = parseFloat(amountIn).toFixed(2);
    // let amount = parseFloat(this.truncator(amountIn, 2)).toString();
    let splitAmount = amount.split(".")[0];
    let i = splitAmount.length - 4;

    while (i >= 0) {
      splitAmount = splitAmount.slice(0, i + 1) + "," + splitAmount.slice(i + 1);
      i = i - 3;
    }
    return "RD$" + splitAmount + "." + amount.split(".")[1];

  }
  logout() {
    this.afAuth.auth.signOut()
    $('.leave-home').click()
  }
  public lineChartData: Array<any> = this.chartInfo
  public lineChartLabels: Array<any> = this.chartLabels
  public lineChartOptions: any = {
    responsive: true,
    showLines: false,
    scales: {
      yAxes: [{
        ticks: {
          fontFamily: 'Futura PT'
        }
      }],
      xAxes: [{
        ticks: {
          fontFamily: 'Futura PT'
        }
      }]
    },
    title: {
      fontFamily: 'Futura PT'
    },
    legend: {
      labels: {
        // This more specific font property overrides the global property
        fontFamily: 'Futura PT'
      }
    }
  };
  public lineChartColors: Array<any> = [
    /*{ // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },*/

    { // grey
      backgroundColor: 'rgba(0, 128, 185,1)',
      borderColor: 'rgba(0, 128, 185,1)',
      pointBackgroundColor: 'rgba(0, 128, 185,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(0, 128, 185,0.8)'
    },
    { // grey
      backgroundColor: 'rgba(	216, 62, 15,1)',
      borderColor: 'rgba(	216, 62, 15,1)',
      pointBackgroundColor: 'rgba(	216, 62, 15,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(	216, 62, 15,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }
  ];
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'bar';

  public randomize(): void {
    let _lineChartData: Array<any> = new Array(this.lineChartData.length);
    for (let i = 0; i < this.lineChartData.length; i++) {
      _lineChartData[i] = { data: new Array(this.lineChartData[i].data.length), label: this.lineChartData[i].label };
      for (let j = 0; j < this.lineChartData[i].data.length; j++) {
        _lineChartData[i].data[j] = Math.floor((Math.random() * 100) + 1);
      }
    }
    this.lineChartData = _lineChartData;
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

}
