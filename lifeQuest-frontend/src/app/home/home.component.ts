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
    this.getUserQuests()
    this.getToDos()
  }
  assignQuest() {
    console.log("einstein");
    this.http.post(`${API_BASE_URL}/quests/assign`, {
      userId: this.userId
    }).subscribe({
      next: (res) => {
        console.log( "Quests assigned:", res);
      },
      error: (err) => {
        console.error("Failed to assign quests:", err);
      }
    });
  }
  getUserQuests() {
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
   deleteTodo(id: number) {
    console.log('Deleting todo with id:', id);
    this.http.delete<void>(`${API_BASE_URL}/todos/${id}`)
      .subscribe({
        next: () => {
          console.log('Todo deleted successfully');
          this.getToDos();
        },
      });
  }
  markQuestAsDone(quest: Quest) {
    console.log('Marking quest as done:', quest.id);
    this.http.put(`${API_BASE_URL}/update-exp/${this.userId}/${quest.id}`, {}).subscribe({
      next: () => {
        console.log(quest.id)
        console.log('Experience points updated successfully');
        this.deleQuest(quest.id);
      },
      error: (err) => {
        console.error('Failed to update experience points:', err);
        if (err.status === 401) {
          alert('This quest is no longer valid or has expired. Please refresh your quests.');
          this.getUserQuests();
        } else {
          alert('Failed to complete quest. Please try again.');
        }
      }
    });
  }
  deleQuest(id: number) {
    this.http.delete(`${API_BASE_URL}/quests/assigned-quest/${id}/${this.userId}`).subscribe({
      next: () => {
        console.log('Quest deleted successfully');
        this.getUserQuests();
      },
      error: (err) => {
        console.error('Failed to delete quest:', err);
        // Show error to user
        alert('Failed to remove quest. Please try again.');
      }
    });
  }
  protected readonly indexedDB = indexedDB;
}
