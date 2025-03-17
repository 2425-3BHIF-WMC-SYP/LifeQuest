import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {


}
