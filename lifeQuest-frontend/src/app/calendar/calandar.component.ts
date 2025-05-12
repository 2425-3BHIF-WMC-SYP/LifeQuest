import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {CalendarModule, CalendarUtils, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { provideAnimations } from '@angular/platform-browser/animations';
import {NavBarComponent} from '../nav-bar/nav-bar.component';
import {CalendarGitterComponent} from '../calendar-gitter/calendar-gitter.component';
import {SidebarComponent} from '../sidebar/sidebar.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    NavBarComponent,
    CalendarGitterComponent,
    SidebarComponent
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
