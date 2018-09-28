import { Component, OnInit } from '@angular/core';
import { TweenMax, Power4 } from 'gsap'
import * as $ from 'jquery'
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {

  deleteButtonText = 'Eliminar'
  constructor(public afAuth: AngularFireAuth) { }
  goBackInTime() {
    TweenMax.staggerTo('.tran-container', 1, { x: '500vw', ease: Power4.easeIn, onComplete: () => {
      $('.register-router').click()
    }}, 0.05)
  }

  ngOnInit() {
    TweenMax.staggerFrom('.tran-container', 1, { x: '500vw', ease: Power4.easeOut }, 0.05)
    console.log(this.afAuth.auth.currentUser)
  }

  deleteTransaction() {

  }
  delete() {
    if(this.deleteButtonText = "Confirmar") {
      this.deleteTransaction()
    }
    setTimeout(()=> {
      this.deleteButtonText = "Eliminar"
    }, 3000)
    this.deleteButtonText = "Confirmar"
  }

}
