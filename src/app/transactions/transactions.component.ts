import { Component, OnInit } from '@angular/core';
import { TweenMax, Power4 } from 'gsap'
import * as $ from 'jquery'
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TransactionsService } from '../transactions.service'
import { Observable } from 'rxjs';
@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  currentTransaction: Object = {}
  deleteButtonText = 'Eliminar'
  transactions: Observable<any[]>
  constructor(public afAuth: AngularFireAuth, private http: HttpClient, private tranService: TransactionsService, public router: Router) { }
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
    console.log(this.afAuth.auth.currentUser)
    this.getThemTransactions()
    /*this.http.get('http://localhost:5005/getTransactions').subscribe((data) => {
      this.transactions = data["data"]
      console.log(this.transactions)
    })*/
  }
  getThemTransactions() {
    this.tranService.getTransactions(null).subscribe(data => {
      this.transactions = data["data"]
    })
  }
  showInfo(t) {
    this.currentTransaction = t
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
  deleteTransaction() {
    this.http.delete('http://localhost:5005/deleteTransaction/' + this.currentTransaction["id"]).subscribe((data) => {
      $('.uk-modal-close').click()
      this.currentTransaction = {}
      this.router.navigateByUrl('/login', { skipLocationChange: true }).then(() => {

        this.router.navigateByUrl('/home/transactions', { skipLocationChange: true });
      })
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
