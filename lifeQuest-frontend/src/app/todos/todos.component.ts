import {Component, OnInit, signal,WritableSignal, effect, Signal} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToDo } from '../types';
import { getUserId, TokenPayload } from '../jwtToken';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import {NavBarComponent} from '../nav-bar/nav-bar.component';

const API_BASE_URL = 'http://localhost:3000';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavBarComponent],
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css']
})
export class TodosComponent implements OnInit {
  todos:WritableSignal<ToDo[]>= signal<ToDo[]>([])
  pendingTodos:ToDo[]=[];
  completedTodos:ToDo[]=[];
  overdueTodos:ToDo[]=[];
  deadLines:ToDo[]=[];

  title: string = '';
  date: string = '';
  toDoStatus: string = 'Pending';
  shouldAdd: boolean = false;
  token: string | null = null;
  userId: number | null = null;

  ngOnInit(): void {
    this.token = localStorage.getItem('token');
    this.userId= this.token ? getUserId(this.token) : null;
    const current= this.todos();
    console.log('Current todos:', current.length);
    console.log('Deadlines before loading todos:', this.deadLines);
    // getTodos will call getPendingToDos, getCompletedToDos, getOverdueToDos, and getDeadlines
    // after the todos are loaded from the API
    this.getTodos();
  }


  constructor(private httpClient: HttpClient) {
    effect(() => {
      const currentTodos = this.todos();
      if (currentTodos && Array.isArray(currentTodos)) {
        this.getPendingToDos();
        this.getCompletedToDos();
        //this.getOverdueToDos();
        console.log('Status arrays updated:', {
          pending: this.pendingTodos.length,
          completed: this.completedTodos.length,
          overdue: this.overdueTodos.length
        });
      } else {
        console.log('Todos signal is not an array or is empty');
      }
    });
  }


  public addTodo() {
    if (!this.title || !this.date) {
      console.error('Title and date are required');
      return;
    }
    this.token = localStorage.getItem('token');
    if (this.token) {
      this.userId = getUserId(this.token);
    }
    if (!this.userId) {
      console.error('User ID is not available. Please log in again.');
      alert('You need to be logged in to add todos. Please log in again.');
      return;
    }
    const toDo: Partial<ToDo> = {
      title: this.title,
      deadline: new Date(this.date),
      status: this.toDoStatus,
      userId: this.userId
    };
    this.httpClient.post<ToDo>(`${API_BASE_URL}/todos`, toDo,{
    }).subscribe({
      next: (newTodo) => {
        console.log('Todo added successfully:', newTodo);
        this.resetForm();
        this.getTodos();
      },
      error: (error) => console.error('Error adding todo:', error)
    });
  }

  private resetForm() {
    this.title = '';
    this.date = '';
    this.toDoStatus = 'Pending';
    this.shouldAdd = false;
  }

  public deleteTodo(id: number) {
    console.log('Deleting todo with id:', id);
    this.httpClient.delete<void>(`${API_BASE_URL}/todos/${id}`)
      .subscribe({
        next: () => {
          console.log('Todo deleted successfully');
          this.getTodos(); // This will update all status arrays
        },
        error: (error) => console.error('Error deleting todo:', error)
      });
  }

  public getTodos() {
    this.token = localStorage.getItem('token');
    if (this.token) {
      this.userId = getUserId(this.token);
    }

    if (!this.userId) {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        this.userId = parseInt(storedUserId, 10);
        console.log('Using userId from localStorage:', this.userId);
      }
    }
    if (!this.userId) {
      console.error('No user ID available');
      return;
    }
    this.httpClient.get<ToDo[]>(`${API_BASE_URL}/todos`, {
      params: { userId: this.userId }
    })
      .subscribe({
        next: (response) => {
          this.todos.set(response);
          this.getPendingToDos();
          this.getCompletedToDos();
          this.getOverdueToDos();
          this.getDeadlines();
          console.log('Deadlines after loading todos:', this.deadLines);
        },
        error: (error) => {
          console.error('Error fetching todos:', error);
          throw error;
        }
      });
  }
  public getPendingToDos(){
    const currentTodos = this.todos();
    this.pendingTodos=currentTodos.filter(x=>x.status==='Pending');
  }
  public getCompletedToDos(){
    const currentTodos = this.todos();
    this.completedTodos=currentTodos.filter(x=>x.status==='Done');
  }
  public getOverdueToDos(){
    const overdueTodos = this.todos();

    this.overdueTodos=overdueTodos.filter(x=>x.status==='Overdue');
    console.log("Overdue todos:",this.overdueTodos);
  }

  public onStatusChange(todo: ToDo) {
    this.httpClient.put<ToDo>(`${API_BASE_URL}/todos/${todo.id}`, todo,{params:{userId:this.userId!}})
      .subscribe({
        next: (updatedTodo) => {
          console.log('Todo status updated successfully:', updatedTodo);
          this.getTodos();
        },
        error: (error) => console.error('Error updating todo status:', error)
      });
  }
  public getDeadlines() {
    const currentTodos = this.todos();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for fair comparison

    this.deadLines = currentTodos
      .filter(x => {
        const deadlineDate = new Date(x.deadline);
        return x.status === 'Pending' && deadlineDate.getTime() >= today.getTime();
      })
      .sort((a, b) => {
        const dateA = new Date(a.deadline);
        const dateB = new Date(b.deadline);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3);

    console.log('Deadlines calculated:', this.deadLines);
  }

}
