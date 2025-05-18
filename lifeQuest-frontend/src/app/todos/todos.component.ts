import { Component, OnInit, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToDo } from '../types';
import { getUserId } from '../jwtToken';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, tap } from 'rxjs';

const API_BASE_URL = 'http://localhost:3000';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css']
})
export class TodosComponent implements OnInit {
  private todosSubject = new BehaviorSubject<ToDo[]>([]);
  todos = toSignal(this.todosSubject);
  
  title: string = '';
  date: string = '';
  toDoStatus: string = 'pending'; 
  shouldAdd: boolean = false;
  userId: number | null = null;

  constructor(private httpClient: HttpClient) {
    const token = localStorage.getItem('token');
    this.userId = token ? getUserId(token) : null;

    // Effect to log todos changes
    effect(() => {
      console.log('Todos updated:', this.todos());
    });
  }

  ngOnInit(): void {
    this.getTodos();
  }

  public addTodo() {
    if (!this.title || !this.date) {
      console.error('Title and date are required');
      return;
    }

    const toDo: Partial<ToDo> = {
      title: this.title,
      deadline: new Date(this.date),
      status: this.toDoStatus,
      userId: this.userId!
    };
    
    this.httpClient.post<ToDo>(`${API_BASE_URL}/todos`, toDo)
      .pipe(
        tap(newTodo => {
          const currentTodos = this.todosSubject.value;
          this.todosSubject.next([...currentTodos, newTodo]);
        })
      )
      .subscribe({
        next: () => this.resetForm(),
        error: (error) => console.error('Error adding todo:', error)
      });
  }

  private resetForm() {
    this.title = '';
    this.date = '';
    this.shouldAdd = false;
  }

  public deleteTodo(id: number) {
    this.httpClient.delete<void>(`${API_BASE_URL}/todos/${id}`)
      .pipe(
        tap(() => {
          const currentTodos = this.todosSubject.value;
          this.todosSubject.next(currentTodos.filter(todo => todo.id !== id));
        })
      )
      .subscribe({
        error: (error) => console.error('Error deleting todo:', error)
      });
  }

  public getTodos() {
    if (!this.userId) {
      console.error('No user ID available');
      return;
    }

    this.httpClient.get<ToDo[]>(`${API_BASE_URL}/todos?userId=${this.userId}`)
      .pipe(
        tap(todos => {
          if (todos && Array.isArray(todos)) {
            this.todosSubject.next(todos);
          } else {
            console.error('Invalid todos data received:', todos);
            this.todosSubject.next([]);
          }
        })
      )
      .subscribe({
        error: (error) => {
          console.error('Error fetching todos:', error);
          this.todosSubject.next([]);
        }
      });
  }
}