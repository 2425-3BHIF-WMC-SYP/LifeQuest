import { Component, OnInit } from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIcon} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
//import {AddEntryComponent} from '../add-entry/add-entry.component';
import {SharedService} from '../shared.service';
import { MiniCalendarComponent } from "../mini-calendar/mini-calendar.component";
import { HttpClient } from '@angular/common/http';
import { Entry } from '../types';
import { getUserId } from '../jwtToken';

const API_BASE_URL = 'http://localhost:3000';

@Component({
  selector: 'app-sidebar',
  imports: [
    MatIconButton,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    MatMenuItem,
    FormsModule,
    MiniCalendarComponent
],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  constructor(private sharedService: SharedService, 
    private client: HttpClient,
  ) {}
  entries: Entry[] = [];
  selectedMenu: number | null = null;
  menuPosition = { x: 0, y: 0 };
  addWindow = false;
  token = localStorage.getItem('token');
  userId = this.token ? getUserId(this.token) : null;
  todaySchedule: Entry[] = [];

  ngOnInit(): void {
    this.getTodaySchedule();
    this.sharedService.addedEntry$.subscribe(() => {
      this.getTodaySchedule();
    });
  }

  toggleMenu(index: number, event: MouseEvent) {
    event.stopPropagation();
    if (this.selectedMenu === index) {
      this.selectedMenu = null;
    } else {
      this.selectedMenu = index;
      this.menuPosition = { x: event.clientX, y: event.clientY };
    }
  }

  addItem():void{
    console.log("einstein")
    this.addWindow = true;
    this.sharedService.updateValue(this.addWindow)
  }


  deleteItem(index: number) {
    this.entries.splice(index, 1);
    this.selectedMenu = null;
  }

  protected readonly indexedDB = indexedDB;

  getTodaySchedule() {
    const today = new Date();
    this.client.get(`${API_BASE_URL}/calendar/entries`, {
      params: {
        userId: this.userId!,
      }
    }).subscribe((data: any) => {
      this.entries = data;
      console.log(this.entries);
      this.todaySchedule = this.filterTodaySchedule(today);
      console.log(this.todaySchedule);

    });
  }
  filterTodaySchedule(today: Date) {
    console.log(today);
    return this.entries.filter(item => {
      const itemDate = new Date(item.entryDate!);
      console.log(today);
      return itemDate.toDateString() === today.toDateString();
    });
  }
  }