import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService } from '../job.service';
import { JobCardComponent } from '../job-card/job-card.component';

@Component({
  selector: 'ts-job-list',
  standalone: true,
  imports: [CommonModule, JobCardComponent],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss'
})
export class JobListComponent implements OnInit {
  jobs: any[] = [];

  constructor(
    private jobService: JobService
  ) {}

  async ngOnInit() {
    this.jobs = await this.jobService.find();
  }
}
