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
import { TransactionsService } from '../transactions.service'
import { Observable } from 'rxjs';
import { NgForm } from '@angular/forms';
import * as UIkit from 'uikit'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  name: string
  nextRoute = 'transactions';
  rawTotalBudget = 0
  totalBudget = this.cashify(0)
  totalIncome = this.cashify(0)
  totalExpenses = this.cashify(0)
  chartInfo = [
    { data: [0, 0, 0, 0, 0, 0, 0], label: 'Ingresos' },
    { data: [0, 0, 0, 0, 0, 0, 0], label: 'Gastos' }
  ];
  currentTransaction: Object = {}
  deleteButtonText = 'Eliminar'
  transactions: Observable<any[]>

  constructor(private router: Router, public afAuth: AngularFireAuth, private http: HttpClient, private tranService: TransactionsService) { }
  routeToGo() {
    TweenMax.to('.login-container', 1, {
      y: '-500vh', ease: Power4.easeIn, onComplete: () => {
        $('.transactions-router').click()
      }
    })
  }
  getName() {
    this.name = localStorage.getItem('user')
  }
  saveCurrentUser() {
    let user = this.afAuth.auth.currentUser
    console.log(user)
    let name = ""
    if (user != null) {
      name = user.email.replace('@contoso.com', '')
      this.http.get('http://localhost:5005/getName/' + name).subscribe((data) => {
        localStorage.setItem('user', data["data"])
        this.name = data["data"]
      })
    } else {
      this.name = localStorage.getItem('user')
    }

  }
  goBackInTime() {
    TweenMax.staggerTo('.tran-container', 1, {
      x: '500vw', ease: Power4.easeIn, onComplete: () => {
        $('.register-router').click()
      }
    }, 0.05)
  }
  helena = this.tranService.helena
  ngOnInit() {
    TweenMax.staggerFrom('.tran-container', 1, { x: '500vw', ease: Power4.easeOut }, 0.05)
    this.getThemTransactions()
    this.saveCurrentUser()
    TweenMax.staggerFrom('.idunno', 1, { x: '-500vw', ease: Power4.easeOut }, 0.2)
    this.http.get('http://localhost:5005/getTableInfo').subscribe((data) => {
      this.totalBudget = this.cashify(data["data"]["total"])
      this.rawTotalBudget = data["data"]["total"]
      this.totalIncome = this.cashify(data["data"]["incomes"])
      this.totalExpenses = this.cashify(data["data"]["expenses"])
    })

    this.http.get('http://localhost:5005/getChartData').subscribe((data) => {
      this.lineChartLabels = data["data"]["dates"]
      this.lineChartData = [
        { data: data["data"]["incomes"], label: "Ingresos" },
        { data: data["data"]["expenses"], label: "Gastos" }
      ]
    })

  }
  updateAll() {
    this.getThemTransactions()
    this.http.get('http://localhost:5005/getTableInfo').subscribe((data) => {
      this.totalBudget = this.cashify(data["data"]["total"])
      this.rawTotalBudget = data["data"]["total"]
      this.totalIncome = this.cashify(data["data"]["incomes"])
      this.totalExpenses = this.cashify(data["data"]["expenses"])
    })
    this.http.get('http://localhost:5005/getChartData').subscribe((data) => {
      this.lineChartLabels = data["data"]["dates"]
      this.lineChartData = [
        { data: data["data"]["incomes"], label: "Ingresos" },
        { data: data["data"]["expenses"], label: "Gastos" }
      ]
    })

  }
  validate(f) {
    if(this.rawTotalBudget < f.value.amount && f.value.transactionType == 'credit') {
      UIkit.notification.closeAll()
      UIkit.notification('El presupuesto no puede quedar por debajo de 0', 'danger');
      return false
    }
    return true
  }
  onSubmit(f: NgForm) {
    f.value.username = this.name
    if (this.validate(f)) {
      this.http.post('http://localhost:5005/saveTransaction', f.value)
        .subscribe(res => {
          $(".uk-modal-close-default").click()
          UIkit.notification.closeAll()
          UIkit.notification('Se ha registrado la transacción', 'success');
          $('.reset-form').click()
          this.updateAll()
        }, error => {
          $(".uk-modal-close-default").click()
          UIkit.notification.closeAll()
          UIkit.notification('Ha ocurrido un error. Intente más tarde', 'danger');
          $('.reset-form').click()
        });
    }
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
    localStorage.removeItem('user')
    $('.leave-home').click()
  }
  getChartLabels() {
    let formats = []
    for (let i = 0; i < 7; i++) {
      let d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      let months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      let dateDummy = new Date(d)
      let formattedDate = months[dateDummy.getMonth()] + " " + dateDummy.getDate()
      formats.push(formattedDate)
    }
    return formats.reverse()
  }
  public lineChartData: Array<any> = this.chartInfo
  public lineChartLabels: Array<any> = this.getChartLabels()
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
  getThemTransactions() {
    this.tranService.getTransactions().subscribe(data => {
      this.transactions = data["data"]
      console.log(this.transactions)
    })
  }
  showInfo(t) {
    this.currentTransaction = t
  }
  deleteTransaction() {
    this.http.delete('http://localhost:5005/deleteTransaction/' + this.currentTransaction["id"])
      .subscribe((data) => {
        $('.uk-modal-close').click()
        this.currentTransaction = {}
        UIkit.notification.closeAll()
        UIkit.notification('Se ha eliminado la transacción', 'success');
        this.updateAll()
      }, error => {
        UIkit.notification.closeAll()
        UIkit.notification('Ha ocurrido un error. Intente más tarde', 'danger');
      })

  }
  delete() {
    if (this.deleteButtonText == "Confirmar") {
      this.deleteTransaction()
    }

    this.deleteButtonText = "Confirmar"
    setTimeout(() => {
      this.deleteButtonText = "Eliminar"
    }, 3000)
    /*this.tranService.toggleNema()
    this.tranService.helenaChange.subscribe(data => this.helena = data)*/
  }

}
