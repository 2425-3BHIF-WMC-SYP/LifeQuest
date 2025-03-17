import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NavBarComponent} from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    NavBarComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
}
