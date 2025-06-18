import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import {isTokenExpired, TokenPayload} from '../jwtToken';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private router: Router) {
    this.checkAuthStatus();
  }
  public checkAuthStatus(): boolean {
    const token = this.getToken();
    const isAuthenticated = !!token && !this.isTokenExpired(token);
    if (!isAuthenticated && token) {
      this.logout('Your session has expired. Please log in again.');
    }
    this.isLoggedInSubject.next(isAuthenticated);
    return isAuthenticated;
  }
  public setToken(token: string): void {
    localStorage.setItem('token', token);
    this.isLoggedInSubject.next(true);
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }
  public isTokenExpired(token: string): boolean {
    try {
      const decodedToken = jwtDecode<TokenPayload>(token);
      const expirationDate = new Date(decodedToken.expiresAt);
      return new Date() > expirationDate;
    } catch (err) {
      console.error('Error checking token expiration:', err);
      return true;
    }
  }
  public logout(message?: string): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
    if (message) {
      // Store the message in sessionStorage to display it on the login page
      sessionStorage.setItem('authMessage', message);
    }
    this.router.navigate(['/login-page']);
  }
  public validateTokenAndRedirect(): boolean {
    const token = this.getToken();
    if (!token) {
      this.logout('Please log in to access this page.');
      return false;
    }
    if (this.isTokenExpired(token)) {
      this.logout('Your session has expired. Please log in again.');
      return false;
    }
    return true;
  }
}
