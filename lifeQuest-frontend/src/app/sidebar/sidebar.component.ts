import { Component } from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIcon} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
//import {AddEntryComponent} from '../add-entry/add-entry.component';
import {SharedService} from '../shared.service';
import { MiniCalendarComponent } from "../mini-calendar/mini-calendar.component";

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
export class SidebarComponent {
  constructor(private sharedService: SharedService) {}
  schedule = [
    { time: '12:00', title: 'Meeting with John', date: 'March 21st' },
    { time: '15:00', title: 'Meeting with Jane', date: 'March 21st' },
    { time: '18:00', title: 'Meeting with Peter', date: 'March 21st' }
  ];
  selectedMenu: number | null = null;
  menuPosition = { x: 0, y: 0 };
  addWindow = false;

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
    this.schedule.splice(index, 1);
    this.selectedMenu = null;
  }

  protected readonly indexedDB = indexedDB;

  editItem() {

  }
  addSchedule() {
  }
}
