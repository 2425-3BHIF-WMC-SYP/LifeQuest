import {Component, OnInit, ElementRef, ViewChild, Renderer2} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {Entry} from '../types';
import {getUserId} from '../jwtToken';
import {SharedService} from '../shared.service';

const API_BASE_URL = 'http://localhost:3000';
const DEFAULT_COLOR = '#7E57C2';
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_OF_WEEK_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

@Component({
  selector: 'app-calendar-gitter',
  templateUrl: './calendar-gitter.component.html',
  styleUrls: ['./calendar-gitter.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class CalendarGitterComponent implements OnInit {

  calendarDays = DAYS_OF_WEEK_SHORT;
  calendarDates = Array.from({length: 24}, (_, i) => `${(i + 1).toString().padStart(2, '0')}:00`);
  shouldAddEntry: boolean=false;
  token = localStorage.getItem('token');
  userId = this.token ? getUserId(this.token) : null;
  showEditor = false;
  color: string = DEFAULT_COLOR;
  x: number = 0;
  y: number = 0;
  selectedTime: string | null = null;
  selectedEndTime: string = '';
  selectedDay: string | null = null;
  calculatedEndTime: number = 0;
  editEntry: boolean = false;
  currentEditingEntryId: number | null = null;
  title: string = '';
  date: Date | null = null;
  entries: Entry[] = [];
  @ViewChild('calendarGrid') calendarGrid!: ElementRef;

  constructor(
    private httpClient: HttpClient,
    private renderer: Renderer2,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.getEntries();
    this.sharedService.dataSubject$.subscribe((value) => {
      this.shouldAddEntry = value;
    });
  }

  addAppointment(time: string, day: string, event: MouseEvent): void {
    this.editEntry = false;
    this.currentEditingEntryId = null;
    const targetSlot = event.target as HTMLElement;
    const calendarGrid = this.calendarGrid.nativeElement;
    const gridRect = calendarGrid.getBoundingClientRect();
    const slotRect = targetSlot.getBoundingClientRect();

    this.x = slotRect.left - gridRect.left;
    this.y = slotRect.top - gridRect.top;

    this.showEditor = true;
    this.selectedTime = time;
    this.selectedDay = day;
    const hour = parseInt(time.split(':')[0], 10);
    this.calculatedEndTime = hour + 1 > 23 ? 23 : hour + 1; // Ensure end time doesn't exceed 23:00
    this.selectedEndTime = `${this.calculatedEndTime.toString().padStart(2, '0')}:00`;
    this.title = '';
    this.color = DEFAULT_COLOR;

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
      colour: this.color,
      startTime: this.selectedTime,
      endTime: this.selectedEndTime,
      userId: userId,
    };

    if (this.editEntry && this.currentEditingEntryId) {
      this.updateEntry(this.currentEditingEntryId, entry);
    } else {
      this.httpClient.post<Entry>(`${API_BASE_URL}/calendar/entries`, entry)
        .pipe(
          catchError(this.handleHttpError)
        )
        .subscribe({
          next: (savedEntry: Entry) => {
            this.entries.push(savedEntry);
            this.clearCalendar();
            this.displayAllEntries();
            this.sharedService.notifyEntryAdded();
            this.close();
          },
          error: (error: string) => {
            this.handleError('Save failed', error);
          }
        });
    }
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
          this.clearCalendar();
          this.displayAllEntries();
        },
        error: (error: string) => {
          this.handleError('Failed to load entries', error);
        }
      });
  }



  prepareEntryForEditing(entry: Entry,event:MouseEvent, x: number, y: number): void {
    this.editEntry = true;
    this.currentEditingEntryId = entry.id!;
    this.showEditor = true;
    this.selectedTime = entry.startTime;
    this.selectedEndTime = entry.endTime;
    this.title = entry.title;
    this.color = entry.colour || DEFAULT_COLOR;
    this.date = new Date(entry.date);

    const dateObj = new Date(entry.date);
    const dayName = DAYS_OF_WEEK[dateObj.getDay()];
    const targetSlot = event.target as HTMLElement;
    const calendarGrid = this.calendarGrid.nativeElement;
    const gridRect = calendarGrid.getBoundingClientRect();
    const slotRect = targetSlot.getBoundingClientRect();

    this.x = slotRect.left - gridRect.left;
    this.y = slotRect.top - gridRect.top;

  }

  updateEntry(entryId: number, updatedEntry: Partial<Entry>): void {
    this.httpClient.put<Entry>(`${API_BASE_URL}/calendar/entry/${entryId}`, updatedEntry)
      .pipe(catchError(this.handleHttpError))
      .subscribe({
        next: (entry: Entry) => {
          const index = this.entries.findIndex(e => e.id === entryId);
          if (index !== -1) {
            this.entries[index] = {...this.entries[index], ...updatedEntry};
          }

          this.clearCalendar();
          this.displayAllEntries();
          this.close();
        },
        error: (error: string) => {
          this.handleError('Failed to update entry', error);
        }
      });
  }

  clearCalendar(): void {
    const allEntryElements = document.querySelectorAll('.calendar-entry');
    allEntryElements.forEach(element => {
      element.remove();
    });
  }

  showEntry(entry: Entry): void {
    console.log("Processing entry:", entry);

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
        const timeIndex = this.calendarDates.findIndex(time => time === entry.startTime);
        const dayIndex = this.calendarDays.findIndex(day => day === dayName.slice(0, 3));

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

      if (entry.id) {
        this.renderer.setAttribute(entryElement, 'data-entry-id', entry.id.toString());
      }
    this.renderer.listen(entryElement, 'click', (event) => {
      event.stopPropagation();
      if (entry.id) {
        const rect = entryElement.getBoundingClientRect();

        const x = rect.left + window.scrollX;
        const y = rect.bottom + window.scrollY;

        this.prepareEntryForEditing(entry,event, x, y);
      }
    });
      this.renderer.setStyle(entryElement, 'backgroundColor', entry.colour || DEFAULT_COLOR);
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
    this.editEntry = false;
    this.currentEditingEntryId = null;
    this.title = '';
    this.color = DEFAULT_COLOR;
    this.sharedService.updateValue(false);
  }

  delete(): void {
    if (!this.currentEditingEntryId) {
      this.handleError('Delete failed', 'No entry selected for deletion');
      return;
    }

    this.httpClient.delete<void>(`${API_BASE_URL}/calendar/entries/${this.currentEditingEntryId}`)
      .pipe(catchError(this.handleHttpError))
      .subscribe({
        next: () => {
          this.entries = this.entries.filter(entry => entry.id !== this.currentEditingEntryId);
          this.clearCalendar();
          this.displayAllEntries();
          this.close();
        },
        error: (error: string) => {
          this.handleError('Failed to delete entry', error);
        }
      });
  }

  closePopUp(): void {
    this.shouldAddEntry = false;
    this.currentEditingEntryId = null;
    this.title = '';
    this.color = DEFAULT_COLOR;
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
}
