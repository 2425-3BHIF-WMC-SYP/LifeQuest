import {Routes} from '@angular/router';
import {LandingPageComponent} from './landing-page/landing-page.component';
import {LoginPageComponent} from './login-page/login-page.component';
import {SignupPageComponent} from './signup-page/signup-page.component';
import {HomeComponent} from './home/home.component';
import {CalendarComponent} from './calendar/calandar.component';
import {SettingsComponent} from './settings/settings.component';
import {StatsoverviewComponent} from './statsoverview/statsoverview.component';
import {TodosComponent} from './todos/todos.component';
import {authGuard} from './guards/auth.guard';

export const routes: Routes = [
  {path: "", component: LandingPageComponent},
  {path: "login-page", component: LoginPageComponent},
  {path: "signup-page", component: SignupPageComponent},
  {path: "home-page",component:HomeComponent,canActivate:[authGuard]},
  {path:"calendar-page", component: CalendarComponent,canActivate:[authGuard]},
  {path: "setting-page",component: SettingsComponent,canActivate:[authGuard]},
  {path: "stats-overview", component: StatsoverviewComponent,canActivate:[authGuard]},
  {path: "todos-page",component:TodosComponent,canActivate:[authGuard]},
];
