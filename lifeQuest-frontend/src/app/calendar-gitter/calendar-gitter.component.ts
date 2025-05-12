import {Component, OnInit, ElementRef, ViewChild, Renderer2} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {Entry} from '../types';
import {getUserId} from '../jwtToken';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {SharedService} from '../shared.service';

const API_BASE_URL = 'http://localhost:3000';
const DEFAULT_COLOR = '#7E57C2';
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
  currentYear: number;
  currentMonthIndex: number;
  currentMonth: string = '';
  calendarDaysInNumber: (number | null)[] = [];
  calendarDays = DAYS_OF_WEEK_SHORT;
  calendarDates = Array.from({length: 24}, (_, i) => `${(i + 1).toString().padStart(2, '0')}:00`);
  weekDays = DAYS_OF_WEEK_SINGLE;
  shouldAddEntry:boolean = false;
  token = localStorage.getItem('token');
  userId = this.token ? getUserId(this.token) : null;
  showEditor = false;
  showColorPicker = false;
  color: string = DEFAULT_COLOR;
  x: number = 0;
  y: number = 0;
  selectedTime: string | null = null;
  selectedEndTime: string = '';
  selectedDay: string | null = null;
  calculatedEndTime: number = 0;
  title: string = '';
  date: Date | null = null;
  entries: Entry[] = [];
  @ViewChild('calendarGrid') calendarGrid!: ElementRef;

  constructor(
    private httpClient: HttpClient,
    private renderer: Renderer2,
    private sharedService: SharedService
  ) {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonthIndex = now.getMonth();
    this.updateMonthDisplay();
  }

  ngOnInit(): void {
    this.getEntries();
    this.generateCalendar();
    this.sharedService.dataSubject$.subscribe((value) => {
      this.shouldAddEntry = value;
    });
  }

  addAppointment(time: string, day: string, event: MouseEvent): void {
    this.x = event.layerX;
    this.y = event.layerY;
    this.showEditor = true;
    this.selectedTime = time;
    this.selectedDay = day;
    const hour = parseInt(time.split(':')[0], 10);
    this.calculatedEndTime = hour + 1 > 23 ? 23 : hour + 1; // Ensure end time doesn't exceed 23:00
    this.selectedEndTime = `${this.calculatedEndTime.toString().padStart(2, '0')}:00`;

    this.calculateDateFromDay(day);
  }
  private calculateDateFromDay(dayName: string): void {
    const currentDate = new Date();
    const todayDayOfWeek = currentDate.getDay();
    const selectedDayIndex = this.getDayIndexFromName(dayName);
    const targetDate = new Date(currentDate);

    let dayDifference = selectedDayIndex - this.convertToStandardDayIndex(todayDayOfWeek);
    targetDate.setDate(currentDate.getDate() + dayDifference);

    this.date = targetDate;
  }

  private getDayIndexFromName(dayName: string): number {
    return this.calendarDays.findIndex(day => day === dayName);
  }

  private convertToStandardDayIndex(dayIndex: number): number {
    return dayIndex === 0 ? 6 : dayIndex - 1;
  }
  save(): void {
    const userId = this.userId;
    if (!userId) {
      this.handleError('Authentication required', 'Please log in to save appointments');
      return;
    }
    if (!this.date || !this.selectedTime || !this.selectedEndTime) {
      this.handleError('Missing data', 'Please ensure all fields are filled out');
      return;
    }
    const entry: Entry = {
      date: this.date,
      title: this.title || 'Untitled Appointment',
      colour:this.color,
      startTime: this.selectedTime,
      endTime: this.selectedEndTime,
      userId: userId,
    };
    console.log(this.color);
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

  private handleHttpError = (error: HttpErrorResponse) => {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => errorMessage);
  }

  private handleError(title: string, message: string): void {
    console.error(`${title}: ${message}`);
  }
  showEntry(entry: Entry): void {
    console.log("Processing entry:", entry);

    this.entries.push(entry);

    try {
      const date = new Date(entry.entryDate || entry.date);

      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${entry.entryDate || entry.date}`);
      }

      const dayName = this.getDayName(date);
      const timeIndex = this.calendarDates.findIndex(time => time === entry.startTime);
      const dayIndex = this.calendarDays.findIndex(day => day === dayName.slice(0, 3));


      if (timeIndex === -1) {
        throw new Error(`Invalid time: ${entry.startTime}`);
      }
      if (dayIndex === -1) {
        throw new Error(`Invalid day: ${dayName}`);
      }

      const slotIndex = (timeIndex * this.calendarDays.length) + dayIndex;
      console.log("Slot index:", slotIndex);

      this.renderEntryInSlot(slotIndex, entry);
    } catch (error) {
      console.error('Error displaying entry:', error);
      this.handleError('Display error', error instanceof Error ? error.message : 'Failed to display entry');
    }
    this.close();
  }
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

  private getDayName(date: Date): string {
    return DAYS_OF_WEEK[date.getDay()];
  }

  close(): void {
    this.showEditor = false;
    this.sharedService.updateValue(this.shouldAddEntry);
    this.title = '';
    this.color = DEFAULT_COLOR;
  }
  closePopUp(): void {
    this.shouldAddEntry = false;
  }

  closeColorPicker(): void {
    this.showColorPicker = false;
  }


  getEntries(): void {
    if (!this.userId) {
      return;
    }
    this.httpClient.get<Entry[]>(`${API_BASE_URL}/calendar/entries`, {
      params: { userId: this.userId }
    })
      .pipe(
        catchError(this.handleHttpError)
      )
      .subscribe({
        next: (entries: Entry[]) => {
          this.entries = entries;
          console.log(this.entries);
          this.displayAllEntries();
        },
        error: (error: string) => {
          this.handleError('Failed to load entries', error);
        }
      });
  }

  private displayAllEntries(): void {
    console.log("Displaying entries:", this.entries);
    this.entries.forEach(entry => {
      try {
        const date = new Date(entry.entryDate || entry.date);

        if (isNaN(date.getTime())) {
          console.error(`Invalid date format for entry:`, entry);
          return;
        }

        const dayName = this.getDayName(date);
        console.log("Processing entry:", entry.title, "Day:", dayName);

        const timeIndex = this.calendarDates.findIndex(time => time === entry.startTime);
        const dayIndex = this.calendarDays.findIndex(day => day === dayName.slice(0, 3));

        console.log("Time index:", timeIndex, "Day index:", dayIndex);

        if (timeIndex === -1) {
          console.error(`Invalid time for entry ${entry.title}:`, entry.startTime);
          return;
        }
        if (dayIndex === -1) {
          console.error(`Invalid day for entry ${entry.title}:`, dayName);
          return;
        }

        const slotIndex = (timeIndex * this.calendarDays.length) + dayIndex;
        this.renderEntryInSlot(slotIndex, entry);
      } catch (error) {
        console.error(`Error displaying entry: ${entry.title}`, error);
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

  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }
}
