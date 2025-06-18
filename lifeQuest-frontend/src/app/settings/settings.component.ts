import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NavBarComponent} from '../nav-bar/nav-bar.component';
import {HttpClient} from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    NavBarComponent,
    CommonModule,
  ],
  standalone:true,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

  oldPassword: string = "";
  newPassword: string = "";
  password: string = "";
  showSuccessMessage: boolean = false;

  constructor(private http : HttpClient) {
  }

  onChangePassword(): void {
    if (this.newPassword && this.newPassword === this.password) {
      const passwordData = {
        oldPassword: this.oldPassword,
        newPassword: this.newPassword
      };

      this.http.put("http://localhost:3000/change-password", passwordData)
        .subscribe({
          next: (response) => {
            this.showSuccessMessage = true;

            this.oldPassword = "";
            this.newPassword = "";
            this.password = "";

            setTimeout(() => {
              this.showSuccessMessage = false;
            }, 5000);
          },
          error: (error) => {
            console.error('Error changing password:', error);
          }
        });
    }
  }

  hideSuccessMessage(): void {
    this.showSuccessMessage = false;
  }
}
