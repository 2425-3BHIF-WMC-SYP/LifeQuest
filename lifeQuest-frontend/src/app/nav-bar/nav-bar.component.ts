import { Component, OnInit } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';

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

  constructor(private router: Router) {
  }

  ngOnInit(): void {

  }

  logout(): void {
      //this.authService.logout();
      this.router.navigate(['/login']);
  }

    protected readonly window = window;
}
