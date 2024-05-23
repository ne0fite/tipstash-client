import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';

import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';

import { JobService } from '../job.service';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../dialog/dialog.service';

@Component({
  selector: 'dt-edit-job',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    FontAwesomeModule,

    ButtonModule,
    CalendarModule,
    InputNumberModule,
    InputSwitchModule,
    InputTextModule,
  ],
  templateUrl: './edit-job.component.html',
  styleUrl: './edit-job.component.scss'
})
export class EditJobComponent implements OnInit {
  @Input() id?: string;

  job: any = {
    name: '',
    payRate: null,
    defaultClockIn: '',
    defaultClockOut: '',
    defaultJob: false
  };

  title = '';

  faChevronLeft = faChevronLeft;

  jobForm = this.formBuilder.group({
    name: new FormControl('', [
      Validators.required
    ]),
    payRate: new FormControl(null, [
      Validators.required
    ]),
    defaultClockIn: new FormControl('', [
      Validators.required
    ]),
    defaultClockOut: new FormControl('', [
      Validators.required
    ]),
    defaultJob: new FormControl(false),
  });

  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastrService: ToastrService,
    private dialogService: DialogService,
    private jobService: JobService,
  ) {}

  get name() {
    return this.jobForm.get('name');
  }

  get payRate() {
    return this.jobForm.get('payRate');
  }

  get defaultClockIn() {
    return this.jobForm.get('defaultClockIn');
  }

  get defaultClockOut() {
    return this.jobForm.get('defaultClockOut');
  }

  get defaultJob() {
    return this.jobForm.get('defaultJob');
  }

  async ngOnInit() {
      if (this.id != null) {
        this.job = await this.jobService.getById(this.id);
        this.jobForm.patchValue(this.job);
        this.title = 'Edit Job';
      } else {
        this.title = 'New Job';
      }
  }

  async saveJob() {
    this.submitted = true;
    if (!this.jobForm.valid) {
      return;
    }

    const dto = {
      ...this.jobForm.value
    };

    try {
      this.job = await this.jobService.save(dto, this.id);
      this.jobForm.patchValue(this.job);
      this.toastrService.success('Job Saved!');
      this.title = 'Edit Job';
    } catch (error) {
      this.toastrService.error('Error Saving Job');
    }
  }

  async deleteJob() {
    if (this.job.id == null) {
      return;
    }

    const result = await this.dialogService.confirm(
      'Are you sure you want to delete this job and all recorded shifts?', {
        title: 'Delete Job?'
      }
    );

    if (result) {
      try {
        await this.jobService.delete(this.job.id);
        this.toastrService.success('Job Deleted!');
        this.router.navigate(['/job']);
      } catch (error) {
        this.toastrService.error('Error Deleting Job');
      }
    }
  }
}
