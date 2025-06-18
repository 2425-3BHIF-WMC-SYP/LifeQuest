import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {UtilsService} from '../shared/utils.service';
import {TokenPayload} from '../jwtToken';
import {AuthService} from '../services/auth.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit {
  requiredData = {
    email: "",
    password: "",
  }
  authMessage: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private utils: UtilsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check for auth message when component initializes
    this.authMessage = sessionStorage.getItem('authMessage');
    if (this.authMessage) {
      // Clear the message after displaying it
      sessionStorage.removeItem('authMessage');
    }
  }

  login() {
    if (this.utils.checkIfMailIsValid(this.requiredData.email)) {
      this.http.post<TokenPayload>("http://localhost:3000/login", this.requiredData).subscribe({
        next: (response) => {
          this.authService.setToken(response.accessToken);
          this.router.navigate(['/home-page']);
        },
        error: error => {
          console.error('Login error:', error);
          this.authMessage = 'Invalid email or password. Please try again.';
        },
      });
    } else {
      this.authMessage = 'Please enter a valid email address.';
    }
  }
}
