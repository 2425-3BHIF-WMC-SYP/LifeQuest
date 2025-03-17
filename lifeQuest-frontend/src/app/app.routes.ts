import {Routes} from '@angular/router';
import {LandingPageComponent} from './landing-page/landing-page.component';
import {LoginPageComponent} from './login-page/login-page.component';
import {SignupPageComponent} from './signup-page/signup-page.component';
import {HomeComponent} from './home/home.component';
import {CalendarComponent} from './calendar/calandar.component';
import {SettingsComponent} from './settings/settings.component';
import {StatsoverviewComponent} from './statsoverview/statsoverview.component';
import {TodosComponent} from './todos/todos.component';
import {AuthGuard} from './auth.guard';

export const routes: Routes = [
  {path: "", component: LandingPageComponent},
  {path: "login-page", component: LoginPageComponent},
  {path: "signup-page", component: SignupPageComponent},
  {path: "home-page",component:HomeComponent},
  {path:"calendar-page", component: CalendarComponent},
  {path: "setting-page",component: SettingsComponent,canActivate:[AuthGuard]},
  {path: "stats-overview", component: StatsoverviewComponent,canActivate:[AuthGuard]},
  {path: "todos-page",component:TodosComponent,canActivate:[AuthGuard]},
];
