import { Component } from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  imports: [
    MatIconButton,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    MatMenuItem
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  schedule = [
    { time: '12:00', title: 'Meeting with John', date: 'March 21st' },
    { time: '15:00', title: 'Meeting with Jane', date: 'March 21st' },
    { time: '18:00', title: 'Meeting with Peter', date: 'March 21st' }
  ];
  selectedMenu: number | null = null;
  menuPosition = { x: 0, y: 0 };

  toggleMenu(index: number, event: MouseEvent) {
    event.stopPropagation();
    if (this.selectedMenu === index) {
      this.selectedMenu = null;
    } else {
      this.selectedMenu = index;
      this.menuPosition = { x: event.clientX, y: event.clientY };
    }
  }

  deleteItem(index: number) {
    this.schedule.splice(index, 1);
    this.selectedMenu = null; // Close menu after deletion
  }

  protected readonly indexedDB = indexedDB;

  editItem() {

  }
  addSchedule() {
  }
}
