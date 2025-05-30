import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {UtilsService} from '../shared/utils.service';
import {TokenPayload} from '../jwtToken';

@Component({
  selector: 'app-login-page',
  imports: [
    FormsModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  requiredData = {
    email: "",
    password: "",
  }

  constructor(private http: HttpClient, private router: Router, private utils: UtilsService) {

  }
  login() {
    if (this.utils.checkIfMailIsValid(this.requiredData.email)) {
      this.http.post<TokenPayload>("http://localhost:3000/login", this.requiredData).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.accessToken);
          this.router.navigate(['/home-page']);
        },
        error: error => console.log(error),
      });
    } else {
      alert("please enter a valid email");
    }

  }

}
