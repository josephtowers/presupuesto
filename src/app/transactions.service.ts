import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  helena = 'ñema'
  helenaChange : Subject<string> = new Subject<string>();
  constructor(private http: HttpClient) {
    this.helenaChange.subscribe((data) => {
      this.helena = data
    })
  }
  toggleNema() {
    this.helenaChange.next("droga")
  }
  getTransactions() : Observable<any> {
    return this.http.get('http://localhost:5005/getTransactions')
  }
}
