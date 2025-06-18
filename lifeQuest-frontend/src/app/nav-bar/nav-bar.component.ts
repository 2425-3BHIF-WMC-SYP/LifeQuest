import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {getUserId, getUsername} from '../jwtToken';
import {HttpClient} from '@angular/common/http';
import {NgOptimizedImage} from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import {User} from '../types';
import { jwtDecode } from 'jwt-decode';


@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  userId: number | null = null;
  profilePictureUrl: string = '/images/profile-icon.png'; // Default profile picture
  private authSubscription: Subscription | null = null;
  userName:string|null= "";
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
    console.log('Token:', token);
    if (token && !this.authService.isTokenExpired(token)) {
      this.isLoggedIn = true;
      this.userId = getUserId(token);
      this.userName = getUsername(token);
      console.log('Username from token:', this.userName);
      console.log('Decoded token:', jwtDecode(token));
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
