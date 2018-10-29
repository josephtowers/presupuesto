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
  
  stringRequest(obj) {
    let res = "transactionType="
    res += obj["transactionType"] + "&month="
    res += obj["month"] + "&year="
    res += obj["year"] + "&greaterThan="
    res += obj["greaterThan"] + "&lessThan="
    res += obj["lessThan"] + "&fromDate="
    res += obj["fromDate"] + "&toDate="
    res += obj["toDate"]
    return res
  }
  getTransactions(filters) : Observable<any> {
    let query = this.stringRequest(filters)
    return this.http.get('http://localhost:5005/getFilteredTransactions?' + query)
  }
}
