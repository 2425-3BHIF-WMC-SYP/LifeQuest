import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<string>(localStorage.getItem('data-theme') || 'light');
  theme = this.themeSubject.asObservable();

  initializeTheme() {
    const savedTheme = localStorage.getItem('data-theme') || 'light';
    this.setTheme(savedTheme);
  }

  setTheme(theme: string) {
    localStorage.setItem('data-theme', theme);
    this.themeSubject.next(theme);
  }
}
