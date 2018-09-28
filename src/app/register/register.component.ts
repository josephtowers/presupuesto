import { Component, OnInit } from '@angular/core';
import { TweenMax, Power4 } from 'gsap'
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  transactionType = [
    'debit',
    'credit'
  ]
  constructor(private http: HttpClient) { }

  ngOnInit() {
    TweenMax.from('.login-container', 1, { y: '-500vh', ease: Power4.easeOut})
  }
  onSubmit(f: NgForm) {
    f.value.username = "pepe"
    this.http.post('http://localhost:5005/saveTransaction', f.value)
        .subscribe(res => {
          //
          console.log(res)
        }, error => {

        });
  }

}
