import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {NavBarComponent} from '../nav-bar/nav-bar.component';
import {getUserId} from '../jwtToken';
import {HttpClient} from '@angular/common/http';
import { Network, DataSet } from 'vis-network/standalone';
import { Thought, ThoughtCategory, ThoughtFormData, ThoughtNode } from '../types';
import { Router } from '@angular/router';

const API_BASE_URL = 'http://localhost:3000';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    FormsModule,
    NavBarComponent
  ],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css'
})
export class NotesComponent {
  @ViewChild('thoughtForm') thoughtForm!: NgForm;
  
  text: string = '';
  category: ThoughtCategory = 'Idee';
  token = localStorage.getItem('token');
  userId = this.token ? getUserId(this.token) : null;
  nodes: DataSet<ThoughtNode> | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  submit(): void {
    if (!this.text.trim() || !this.category || !this.userId) {
      return;
    }

    const newThought: ThoughtFormData = {
      userId: this.userId,
      text: this.text.trim(),
      category: this.category
    };

    this.http.post<Thought>(`${API_BASE_URL}/thoughts`, newThought).subscribe({
      next: (response: Thought) => {
        if (this.nodes) {
          const newNode: ThoughtNode = {
            id: response.id,
            label: response.text,
            group: response.category,
            title: `${response.category}: ${response.text}`
          };

          this.nodes.add(newNode);
        }
        this.text = '';
        this.category = 'Idee';
        this.thoughtForm.resetForm();

        console.log('Thought added successfully');
        this.router.navigate(['/thought-network']);
      },
      error: (error) => {
        console.error('Error adding thought:', error);
      }
    });
  }
}
