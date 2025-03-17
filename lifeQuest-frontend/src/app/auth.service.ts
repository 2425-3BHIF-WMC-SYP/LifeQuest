import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private isLoggedInSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
    isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

    constructor() {}

    public isAuthenticated(): boolean {
        return !!localStorage.getItem('authToken');
    }

    private isLoggedIn(): boolean {
        return this.isLoggedInSubject.value;
    }
    public login(token:string): void {
        localStorage.setItem('authToken',token);
    }

    public logout(): void {
        localStorage.removeItem('authToken');
        this.isLoggedInSubject.next(false);
    }
}
