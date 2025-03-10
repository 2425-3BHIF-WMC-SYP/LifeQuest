import {Routes} from '@angular/router';
import {LandingPageComponent} from './landing-page/landing-page.component';
import {LoginPageComponent} from './login-page/login-page.component';
import {SignupPageComponent} from './signup-page/signup-page.component';
import {HomeComponent} from './home/home.component';
import {CalandarComponent} from './calendar/calandar.component';

export const routes: Routes = [
  {path: "", component: LandingPageComponent},
  {path: "login-page", component: LoginPageComponent},
  {path: "signup-page", component: SignupPageComponent},
  {path: "home-page",component:HomeComponent},
  {path:"calendar-page", component: CalandarComponent},
];
