import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login-page',
  imports: [
    FormsModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  requiredData={
    email:"",
    password:"",
  }
  constructor(private http:HttpClient, private router:Router) {

  }
  login(){
    this.http.post("http://localhost:3000/login",this.requiredData).subscribe({
      next: () => this.router.navigate(['/home']),
      error: error => console.log(error),
    })
  }

}
