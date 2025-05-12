import { Component, OnInit } from '@angular/core';


const DAYS_OF_WEEK_SINGLE = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
@Component({
  selector: 'app-mini-calendar',
  imports: [],
  templateUrl: './mini-calendar.component.html',
  styleUrl: './mini-calendar.component.css'
})

export class MiniCalendarComponent implements OnInit {


  currentYear: number;
  currentMonthIndex: number;
  currentMonth: string = '';
  calendarDaysInNumber: (number | null)[] = [];
  weekDays = DAYS_OF_WEEK_SINGLE;



  constructor(){
      const now = new Date();
      this.currentYear = now.getFullYear();
      this.currentMonthIndex = now.getMonth();
      this.updateMonthDisplay();
  }

  ngOnInit(): void {
       this.generateCalendar();
  }


    private getDaysInMonth(year: number, month: number): number {
        return new Date(year, month + 1, 0).getDate();
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

 
  updateMonthDisplay(): void {
    const date = new Date(this.currentYear, this.currentMonthIndex);
    this.currentMonth = date.toLocaleString('default', {month: 'long'});
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
  

}
