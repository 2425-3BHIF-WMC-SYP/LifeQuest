import {Component, OnInit} from '@angular/core';
import {NavBarComponent} from '../nav-bar/nav-bar.component';
import { HttpClient } from '@angular/common/http';
import {Quest, ToDo} from '../types';
import {getUserId} from '../jwtToken';
import {DatePipe} from '@angular/common';
const API_BASE_URL = 'http://localhost:3000';

@Component({
  selector: 'app-home',
  imports: [
    NavBarComponent,
    DatePipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  title = 'Home';
  description = 'Welcome to the home page!';
  quests:Quest[]=[]

  token = localStorage.getItem('token');
  userId = this.token ? getUserId(this.token) : null;
  todos:ToDo[]=[];

  constructor(private http: HttpClient) {

  }
  ngOnInit(): void {
    console.log('HomeComponent initialized');
    this.assignQuest()
    this.getQuests()
    this.getToDos()
  }

  assignQuest() {
    console.log("einstein");
    this.http.post(`${API_BASE_URL}/quests/assign`, {
      userId: this.userId
    }).subscribe({
      next: (res) => {
        console.log("Quests assigned:", res);
      },
      error: (err) => {
        console.error("Failed to assign quests:", err);
      }
    });
  }
  getQuests() {
    console.log(this.userId)
    this.http.get<Quest[]>(`${API_BASE_URL}/quests`,
      {params:{userId:this.userId!}})
      .subscribe(res=> this.quests = res);
  }
  getToDos(){
    this.http.get<ToDo[]>(`${API_BASE_URL}/todos`, {
      params: { userId: this.userId!}
    }).subscribe(res=> this.todos = res);
  }

  protected readonly indexedDB = indexedDB;
}
