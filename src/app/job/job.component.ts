import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { ButtonModule } from 'primeng/button';

import { JobListComponent } from './job-list/job-list.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-job',
  standalone: true,
  imports: [
    RouterLink,
    FontAwesomeModule,
    ButtonModule,
    JobListComponent
  ],
  templateUrl: './job.component.html',
  styleUrl: './job.component.scss'
})
export class JobComponent {
  faPlus = faPlus;
}
