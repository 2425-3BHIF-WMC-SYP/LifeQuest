import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { getUserId } from '../jwtToken';
import {HttpClient} from '@angular/common/http';
import {NgOptimizedImage} from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nav-bar',
  imports: [
    RouterLink,
    RouterLinkActive,
    NgOptimizedImage,
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  userId: number | null = null;
  profilePictureUrl: string = '/images/profile-icon.png'; // Default profile picture
  private authSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.checkTokenAndUpdateUI();

    this.authSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (!isLoggedIn) {
        this.profilePictureUrl = "/images/standard-pfp.jpg";
      } else {
        this.checkTokenAndUpdateUI();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private checkTokenAndUpdateUI(): void {
    const token = this.authService.getToken();
    console.log(token);
    if (token && !this.authService.isTokenExpired(token)) {
      this.isLoggedIn = true;
      this.userId = getUserId(token);
      console.log(this.userId);
      if (this.userId) {
        console.log(this.userId);
        this.profilePictureUrl = `http://localhost:3000/profile-picture/${this.userId}`;
      } else {
        this.profilePictureUrl = "/images/profile-icon.png";
      }
    } else {
      this.isLoggedIn = false;
      this.profilePictureUrl = "/images/standard-pfp.jpg";
      console.log('Not logged in or token expired.');
    }
  }

  logout(): void {
      this.authService.logout();
  }

    protected readonly window = window;
}
