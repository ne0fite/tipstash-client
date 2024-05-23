import { Routes } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { JobComponent } from './job/job.component';
import { ShiftComponent } from './shift/shift.component';
import { EditJobComponent } from './job/edit-job/edit-job.component';
import { EditShiftComponent } from './shift/edit-shift/edit-shift.component';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },

  { path: 'job', component: JobComponent, canActivate: [AuthGuard] },
  { path: 'job/new', component: EditJobComponent, canActivate: [AuthGuard] },
  { path: 'job/:id', component: EditJobComponent, canActivate: [AuthGuard] },

  { path: 'shift', component: ShiftComponent, canActivate: [AuthGuard] },
  { path: 'shift/new', component: EditShiftComponent, canActivate: [AuthGuard] },
  { path: 'shift/:id', component: EditShiftComponent, canActivate: [AuthGuard] },

  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
];
