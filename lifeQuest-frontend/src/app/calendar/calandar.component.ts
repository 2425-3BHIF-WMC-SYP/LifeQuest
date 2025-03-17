import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent, CalendarModule, CalendarUtils, CalendarView, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { provideAnimations } from '@angular/platform-browser/animations';
import { addDays, startOfDay } from 'date-fns';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule 
  ],
  providers: [
    provideAnimations(),
    {
      provide: DateAdapter,
      useFactory: adapterFactory
    },
    CalendarUtils,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {

}
