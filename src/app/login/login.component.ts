import { Component, OnInit } from '@angular/core';
import { 
  TweenMax,
  Circ
} from 'gsap'
import * as $ from 'jquery'
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import * as firebase from 'firebase'
import * as UIkit from 'uikit'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(public afAuth: AngularFireAuth) { }

  goHome(e) {
    e.preventDefault()
  }
  ngOnInit() {
    TweenMax.from('.login-container', 0.6, { y: '-1000vh', ease: Circ.easeOut})
    console.log(this.afAuth.auth.currentUser)
    console.log(firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION))
  }
  login() {
    let user = $("#user").val()+"@contoso.com";
    let pass = $("#pass").val();
    this.afAuth.auth.signInWithEmailAndPassword(user, pass).then(
      () => $('.go-home').click(),
      (e) => {
        switch(e.code) {
          case "auth/invalid-email": {
            UIkit.notification.closeAll()
            UIkit.notification('El usuario no es válido', 'danger');
            break;
          }
          case "auth/user-disabled": {
            UIkit.notification.closeAll()
            UIkit.notification('El usuario está desactivado', 'danger');
            break;
          }
          case "auth/user-not-found": {
            UIkit.notification.closeAll()
            UIkit.notification('El usuario y la contraseña no son correctas', 'danger');
            break;
          }
          case "auth/wrong-password": {
            UIkit.notification.closeAll()
            UIkit.notification('El usuario y la contraseña no son correctas', 'danger');
            break;
          }
          default: {
            UIkit.notification.closeAll()
            UIkit.notification('Se ha producido un error, intente más tarde', 'danger');
            break;
          }
          
        }
      }
        ,
    
    )
  }
  logout() {
    this.afAuth.auth.signOut();
  }

}
