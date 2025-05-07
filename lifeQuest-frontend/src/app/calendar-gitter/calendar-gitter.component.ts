import {Component, OnInit, ElementRef, ViewChild, Renderer2} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {Entry} from '../types';
import {getUserId} from '../jwtToken';
import {SidebarComponent} from '../sidebar/sidebar.component';

// Constants
const API_BASE_URL = 'http://localhost:3000';
const DEFAULT_COLOR = '#7E57C2'; // Changed from #C05885 to a purple that matches the calendar grid
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_OF_WEEK_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_OF_WEEK_SINGLE = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

@Component({
  selector: 'app-calendar-gitter',
  templateUrl: './calendar-gitter.component.html',
  styleUrls: ['./calendar-gitter.component.css'],
  standalone: true,
  imports: [FormsModule, SidebarComponent]
})
export class CalendarGitterComponent implements OnInit {
  // Calendar state
  currentYear: number;
  currentMonthIndex: number;
  currentMonth: string = '';
  calendarDaysInNumber: (number | null)[] = [];
  calendarDays = DAYS_OF_WEEK_SHORT;
  calendarDates = Array.from({length: 24}, (_, i) => `${(i + 1).toString().padStart(2, '0')}:00`);
  weekDays = DAYS_OF_WEEK_SINGLE;

  token = localStorage.getItem('token');
  userId = this.token ? getUserId(this.token) : null;

  // UI state
  showEditor = false;
  showColorPicker = false;
  color: string = DEFAULT_COLOR;
  x: number = 0;
  y: number = 0;

  // Entry data
  selectedTime: string | null = null;
  selectedEndTime: string = '';
  selectedDay: string | null = null;
  calculatedEndTime: number = 0;
  title: string = '';
  date: Date | null = null;
  entries: Entry[] = [];


  /**
   * ViewChild for the calendar grid to use with Renderer2
   */
  @ViewChild('calendarGrid') calendarGrid!: ElementRef;

  constructor(
    private httpClient: HttpClient,
    private renderer: Renderer2
  ) {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonthIndex = now.getMonth();
    this.updateMonthDisplay();
  }

  ngOnInit(): void {
    this.getEntries();
    this.generateCalendar();
  }

  /**
   * Opens the appointment editor when a time slot is clicked
   * @param time The time slot that was clicked (e.g. "09:00")
   * @param day The day that was clicked (e.g. "Mon")
   * @param event The mouse event
   */
  addAppointment(time: string, day: string, event: MouseEvent): void {
    // Position the editor popup at the click location
    this.x = event.layerX;
    this.y = event.layerY;

    // Set initial values for the editor
    this.showEditor = true;
    this.selectedTime = time;
    this.selectedDay = day;

    // Calculate default end time (1 hour after start time)
    const hour = parseInt(time.split(':')[0], 10);
    this.calculatedEndTime = hour + 1 > 23 ? 23 : hour + 1; // Ensure end time doesn't exceed 23:00
    this.selectedEndTime = `${this.calculatedEndTime.toString().padStart(2, '0')}:00`;

    // Calculate the date based on the selected day
    this.calculateDateFromDay(day);
  }

  /**
   * Calculates a Date object from the selected day name
   * @param dayName The name of the day (e.g. "Mon")
   */
  private calculateDateFromDay(dayName: string): void {
    const currentDate = new Date();
    const todayDayOfWeek = currentDate.getDay();
    const selectedDayIndex = this.getDayIndexFromName(dayName);
    const targetDate = new Date(currentDate);

    let dayDifference = selectedDayIndex - this.convertToStandardDayIndex(todayDayOfWeek);
    targetDate.setDate(currentDate.getDate() + dayDifference);

    this.date = targetDate;
  }

  /**
   * Gets the index of a day name in the calendarDays array
   * @param dayName The name of the day (e.g. "Mon")
   * @returns The index of the day in the calendarDays array
   */
  private getDayIndexFromName(dayName: string): number {
    return this.calendarDays.findIndex(day => day === dayName);
  }

  /**
   * Converts JavaScript's day index (0=Sunday) to our calendar's day index (0=Monday)
   * @param dayIndex JavaScript's day index (0-6, where 0 is Sunday)
   * @returns Our calendar's day index (0-6, where 0 is Monday)
   */
  private convertToStandardDayIndex(dayIndex: number): number {
    return dayIndex === 0 ? 6 : dayIndex - 1;
  }

  /**
   * Saves the current appointment to the database
   */
  save(): void {
    // Validate user is logged in
    const userId = this.userId;
    if (!userId) {
      this.handleError('Authentication required', 'Please log in to save appointments');
      return;
    }

    // Validate required fields
    if (!this.date || !this.selectedTime || !this.selectedEndTime) {
      this.handleError('Missing data', 'Please ensure all fields are filled out');
      return;
    }

    // Create entry object
    const entry: Entry = {
      date: this.date,
      title: this.title || 'Untitled Appointment', // Provide default title if empty
      startTime: this.selectedTime,
      endTime: this.selectedEndTime,
      userId: userId,
    };

    // Save entry to database
    this.httpClient.post<Entry>(`${API_BASE_URL}/calendar/entries`, entry)
      .pipe(
        catchError(this.handleHttpError)
      )
      .subscribe({
        next: (savedEntry: Entry) => {
          this.showEntry(savedEntry);
        },
        error: (error: string) => {
          this.handleError('Save failed', error);
        }
      });
  }

  /**
   * Handles HTTP errors and returns a user-friendly error message
   * @param error The HTTP error response
   * @returns An observable with the error message
   */
  private handleHttpError = (error: HttpErrorResponse) => {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => errorMessage);
  }

  /**
   * Displays an error message (currently logs to console, could be enhanced with a UI notification)
   * @param title The error title
   * @param message The error message
   */
  private handleError(title: string, message: string): void {
    // In a real application, this would show a user-friendly error message in the UI
    console.error(`${title}: ${message}`);
    // TODO: Add a UI notification component for errors
  }

  /**
   * Adds an entry to the calendar display and updates the entries array
   * @param entry The entry to display
   */
  showEntry(entry: Entry): void {
    // Add entry to the entries array
    this.entries.push(entry);

    try {
      // Get the day name from the entry date
      const date = new Date(entry.date);
      const dayName = this.getDayName(date);

      // Find the indices for the time slot
      const timeIndex = this.calendarDates.findIndex(time => time === entry.startTime);
      const dayIndex = this.calendarDays.findIndex(day => day === dayName.slice(0, 3));

      if (timeIndex === -1 || dayIndex === -1) {
        throw new Error(`Invalid time (${entry.startTime}) or day (${dayName})`);
      }

      // Calculate the slot index
      const slotIndex = (timeIndex * this.calendarDays.length) + dayIndex;

      // Use Renderer2 to create and append the entry element
      this.renderEntryInSlot(slotIndex, entry);
    } catch (error) {
      this.handleError('Display error', error instanceof Error ? error.message : 'Failed to display entry');
    }
    this.close();
  }

  /**
   * Renders an entry in the specified time slot using Renderer2
   * @param slotIndex The index of the slot in the grid
   * @param entry The entry to render
   */
  private renderEntryInSlot(slotIndex: number, entry: Entry): void {
    const allSlots = document.querySelectorAll('.time-slot');

    if (slotIndex >= 0 && slotIndex < allSlots.length) {
      const targetSlot = allSlots[slotIndex];

      const entryElement = this.renderer.createElement('div');
      this.renderer.addClass(entryElement, 'calendar-entry');
      this.renderer.setProperty(entryElement, 'textContent', entry.title || 'Appointment');

      const title = entry.title || 'Appointment';
      const calculatedWidth = Math.max(50, Math.min(200, title.length * 6));
      this.renderer.setAttribute(entryElement, 'title', title);

      this.renderer.setStyle(entryElement, 'backgroundColor', this.color || '#e0e7ff');
      this.renderer.setStyle(entryElement, 'padding', '2px 4px');
      this.renderer.setStyle(entryElement, 'borderRadius', '3px');
      this.renderer.setStyle(entryElement, 'margin', '2px 0');
      this.renderer.setStyle(entryElement, 'fontSize', '11px');
      this.renderer.setStyle(entryElement, 'width', `${calculatedWidth}px`);
      this.renderer.setStyle(entryElement, 'overflow', 'hidden');
      this.renderer.setStyle(entryElement, 'textOverflow', 'ellipsis');
      this.renderer.setStyle(entryElement, 'whiteSpace', 'nowrap');
      this.renderer.setStyle(entryElement, 'cursor', 'pointer');

      this.renderer.appendChild(targetSlot, entryElement);
    } else {
      throw new Error(`Slot index out of range: ${slotIndex}, total slots: ${allSlots.length}`);
    }
  }

  /**
   * Gets the full day name from a Date object
   * @param date The date object
   * @returns The full day name (e.g. "Monday")
   */
  private getDayName(date: Date): string {
    return DAYS_OF_WEEK[date.getDay()];
  }

  close(): void {
    this.showEditor = false;
    this.title = '';
    this.color = DEFAULT_COLOR;
  }

  closeColorPicker(): void {
    this.showColorPicker = false;
  }


  getEntries(): void {
    this.httpClient.get<Entry[]>(`${API_BASE_URL}/calendar/entries`)
      .pipe(
        catchError(this.handleHttpError)
      )
      .subscribe({
        next: (entries: Entry[]) => {
          this.entries = entries;
          this.displayAllEntries();
        },
        error: (error: string) => {
          this.handleError('Failed to load entries', error);
        }
      });
  }

  private displayAllEntries(): void {
    this.entries.forEach(entry => {
      try {
        const date = new Date(entry.date);
        const dayName = this.getDayName(date);
        const timeIndex = this.calendarDates.findIndex(time => time === entry.startTime);
        const dayIndex = this.calendarDays.findIndex(day => day === dayName.slice(0, 3));

        if (timeIndex !== -1 && dayIndex !== -1) {
          const slotIndex = (timeIndex * this.calendarDays.length) + dayIndex;
          this.renderEntryInSlot(slotIndex, entry);
        }
      } catch (error) {
        // Log error but continue with other entries
        console.warn(`Error displaying entry: ${entry.title}`, error);
      }
    });
  }

  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonthIndex, 1).getDay();

    const lastDate = this.getDaysInMonth(this.currentYear, this.currentMonthIndex);
    const prevMonthLastDate = this.getDaysInMonth(this.currentYear, this.currentMonthIndex - 1);

    const emptyDays = firstDay === 0 ? 6 : firstDay - 1;

    this.calendarDaysInNumber = [];

    for (let i = emptyDays; i > 0; i--) {
      this.calendarDaysInNumber.push(prevMonthLastDate - i + 1);
    }

    for (let i = 1; i <= lastDate; i++) {
      this.calendarDaysInNumber.push(i);
    }
    while (this.calendarDaysInNumber.length % 7 !== 0) {
      this.calendarDaysInNumber.push(null);
    }
  }

  prevMonth(): void {
    this.currentMonthIndex--;
    if (this.currentMonthIndex < 0) {
      this.currentMonthIndex = 11; // December
      this.currentYear--;
    }
    this.updateMonthDisplay();
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonthIndex++;
    if (this.currentMonthIndex > 11) {
      this.currentMonthIndex = 0;
      this.currentYear++;
    }
    this.updateMonthDisplay();
    this.generateCalendar();
  }

  updateMonthDisplay(): void {
    const date = new Date(this.currentYear, this.currentMonthIndex);
    this.currentMonth = date.toLocaleString('default', {month: 'long'});
  }

  /**
   * Gets the number of days in a specific month
   * @param year The year
   * @param month The month index (0-11)
   * @returns The number of days in the month
   */
  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }
}
