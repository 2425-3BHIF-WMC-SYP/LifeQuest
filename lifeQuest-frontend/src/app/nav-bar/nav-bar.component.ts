import { Component, OnInit } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-nav-bar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent implements OnInit {
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
  }
    
  ngOnInit(): void {
      this.authService.isLoggedIn$.subscribe(loggedIn => this.isLoggedIn = loggedIn);
  }

  logout(): void {
      this.authService.logout();
      this.router.navigate(['/login']);
  }

    protected readonly window = window;
}
