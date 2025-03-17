import { Component } from '@angular/core';

@Component({
  selector: 'app-date-picker',
  imports: [],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css'
})
export class DatePickerComponent {
    selectedDate: Date|null = null;
}
