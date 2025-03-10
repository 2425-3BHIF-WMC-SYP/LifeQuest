import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css'
})
export class SignupPageComponent {
  isLoading=false;
  formData ={
    username:'',
    password:'',
    email:'',
    age:null,
    sex:'',
    picture:''
  }
  constructor(private http:HttpClient,private router:Router) {
  }
  onSignupSubmit() {
    if (this.isLoading) return;
    this.isLoading = true;

    const formData = new FormData();
    formData.append('username', this.formData.username);
    formData.append('email', this.formData.email);
    formData.append('password', this.formData.password);
    formData.append('age', this.formData.age || '');
    formData.append('sex', this.formData.sex);

    if (this.formData.picture) {
      formData.append('pfp', this.formData.picture);
    }

    this.http.post('http://localhost:3000/signup', formData).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (e) => {
        this.isLoading = false;
        if (e.status === 403)
              alert("user with this mail already exists!");
        else
            alert("An error occured!, Please try again later.");
      },
      complete: () => (this.isLoading = false),
    });
  }
}
