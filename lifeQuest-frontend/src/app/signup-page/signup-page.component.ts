import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {ThemeService} from '../shared/themeService';
import {UtilsService} from '../shared/utils.service';
import {requiredUserInformation} from '../types';
import {TokenPayload} from '../jwtToken';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule
  ],
  templateUrl: './signup-page.component.html',
  styleUrls: ['signup-page.component.css']
})
export class SignupPageComponent implements OnInit {
  currentTheme = localStorage.getItem('data-theme') || 'light';
  formData: requiredUserInformation= {
    username: '',
    password: '',
    email: '',
    sex:"male",
    age: null,
    picture: null,
  };
  protected open:boolean = false;
  protected openSettings = false;

  protected index = 0;

  previewUrl = '';

  isLoading = false;

  constructor(private http: HttpClient,
              private router: Router,
              private themeService: ThemeService,
              private utilsService: UtilsService,
  ) {
  }

  protected onClick(): void {
    this.open = false;
    this.index = 1;
  }

  ngOnInit() {
    // Set initial theme based on formData.sex
    this.toggleTheme(this.formData.sex);

    this.themeService.theme.subscribe(theme => {
      this.currentTheme = theme;
      document.documentElement.setAttribute('data-theme', theme);
    });
  }

  toggleTheme(theme: string) {
    this.themeService.setTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const sanitizedFileName = file.name.split(/[\\/]/).pop() || file.name;
      this.formData.picture = new File([file], sanitizedFileName, { type: file.type });

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      }
      reader.readAsDataURL(file);
    }
  }


  onSignupSubmit() {
    if (this.isLoading) return;
    this.isLoading = true;

    if (this.utilsService.checkIfMailIsValid(this.formData.email)) {
      const formData = new FormData();
      formData.append('username', this.formData.username);
      formData.append('password', this.formData.password);
      formData.append('email', this.formData.email);
      if (this.formData.age !== null) {
        formData.append('age', this.formData.age?.toString());
      }
      formData.append('sex', this.formData.sex);
      if (this.formData.picture) {
        formData.append('picture', this.formData.picture, this.formData.picture.name);
      }
      this.http.post<TokenPayload>('http://localhost:3000/signup', formData).subscribe({
        next: (response) => {
          console.log(response)
          localStorage.setItem('token',response.accessToken);
          this.router.navigate(['/home-page'])
        },
        error: (e) => {
          this.isLoading = false;
          if (e.status === 403)
            alert("user with this mail already exists!");
          else
            alert("An error occured!, Please try again later.");
        },
        complete: () => (this.isLoading = false),
      });
    } else {
      alert("Please enter a valid email");
      this.isLoading = false;
    }
  }

  protected readonly document = document;
}
