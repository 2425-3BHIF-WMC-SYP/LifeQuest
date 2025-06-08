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
      this.logout();
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
      console.log('Error checking token expiration:', err);
      return true;
    }
  }
  public logout(): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login-page']);
  }
  public validateTokenAndRedirect(): boolean {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  }
}
