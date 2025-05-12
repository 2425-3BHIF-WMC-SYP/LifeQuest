import {Component, OnInit} from '@angular/core';
import {NavBarComponent} from '../nav-bar/nav-bar.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [
    NavBarComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  title = 'Home';
  description = 'Welcome to the home page!';

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    console.log('HomeComponent initialized');
  }

  getQuests() {
      this.http.get('https://api.example.com/quests')
        .subscribe((response: any) => {
          console.log('Quests:', response);
        }
        );
      
  }

}
