import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon';

import { ButtonModule } from 'primeng/button';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { DialogService } from '../../dialog/dialog.service';
import { ShiftService } from '../shift.service';
import { JobService } from '../../job/job.service';

@Component({
  selector: 'app-edit-shift',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    FontAwesomeModule,

    ButtonModule,
    CalendarModule,
    DropdownModule,
    InputNumberModule,
    InputSwitchModule,
    InputTextModule,
    InputTextareaModule,
  ],
  templateUrl: './edit-shift.component.html',
  styleUrl: './edit-shift.component.scss'
})
export class EditShiftComponent implements OnInit {
  @Input() id?: string;

  shift: any = {
    jobId: null,
    date: new Date(),
    amount: null,
    clockIn: null,
    clockOut: null,
    sales: null,
    tipOut: 0,
    notes: null
  };

  title = '';

  faChevronLeft = faChevronLeft;

  shiftForm = this.formBuilder.group({
    jobId: new FormControl(null, [
      Validators.required
    ]),
    date: new FormControl(null, [
      Validators.required
    ]),
    clockIn: new FormControl('', [
      Validators.required
    ]),
    clockOut: new FormControl('', [
      Validators.required
    ]),
    amount: new FormControl(null, [
      Validators.required
    ]),
    sales: new FormControl(null, [
      Validators.required
    ]),
    tipOut: new FormControl(0),
    notes: new FormControl(''),
  });

  jobs: any[] = [];

  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastrService: ToastrService,
    private dialogService: DialogService,
    private jobService: JobService,
    private shiftService: ShiftService,
  ) { }

  get jobId() {
    return this.shiftForm.get('jobId');
  }

  get date() {
    return this.shiftForm.get('date');
  }

  get amount() {
    return this.shiftForm.get('amount');
  }

  get clockIn() {
    return this.shiftForm.get('clockIn');
  }

  get clockOut() {
    return this.shiftForm.get('clockOut');
  }

  get sales() {
    return this.shiftForm.get('sales');
  }

  get tipOut() {
    return this.shiftForm.get('tipOut');
  }

  get notes() {
    return this.shiftForm.get('notes');
  }

  async ngOnInit() {
    this.jobs = await this.jobService.find();

    if (this.id != null) {
      this.shift = await this.shiftService.getById(this.id);
      this.title = 'Edit Shift';

      this.shift.date = DateTime.fromFormat(this.shift.date, 'yyyy-MM-dd').toJSDate();
      this.shift.clockIn = new Date(this.shift.clockIn);
      this.shift.clockOut = new Date(this.shift.clockOut);
    } else {
      this.title = 'New Shift';

      const defaultJob = this.jobs.find((job) => job.defaultJob);
      if (defaultJob) {
        this.shift.jobId = defaultJob.id;

        this.updateClockIn(defaultJob);
      }
    }

    this.shiftForm.patchValue(this.shift);
  }

  updateClockIn(job: any) {
    this.shift.clockIn = new Date(`${DateTime.now()
      .toFormat('yyyy-MM-dd')}T${job.defaultClockIn}`);
    this.shift.clockOut = new Date(`${DateTime.now()
      .toFormat('yyyy-MM-dd')}T${job.defaultClockOut}`);
    if (this.shift.clockOut < this.shift.clockIn) {
      this.shift.clockOut = new Date(this.shift.clockOut.getTime() + 86400000);
    }
  }

  onJobChange(event: DropdownChangeEvent) {
    const { value: selectedJobId } = event;
    const selectedJob = this.jobs.find(job => job.id === selectedJobId);
    if (selectedJob) {
      this.updateClockIn(selectedJob);
      this.shiftForm.patchValue(this.shift);
    }
  }

  async saveShift(andAdd = false) {
    this.submitted = true;
    if (!this.shiftForm.valid) {
      return;
    }

    const dto = {
      ...this.shiftForm.value
    };

    try {
      const savedShift = await this.shiftService.save(dto, this.id);

      this.toastrService.success('Shift Saved!');

      this.submitted = false;

      if (andAdd) {
        this.shift = {
          date: new Date(this.shift.date),
          clockIn: new Date(this.shift.clockIn),
          clockOut: new Date(this.shift.clockOut),
          amount: null,
          sales: null,
          tipOut: 0,
          notes: null
        };
      } else {
        this.shift = savedShift;
        this.shift.date = new Date(this.shift.date);
        this.shift.clockIn = new Date(this.shift.clockIn);
        this.shift.clockOut = new Date(this.shift.clockOut);
        this.title = 'Edit Shift';
      }

      this.shiftForm.patchValue(this.shift);
    } catch (error) {
      this.toastrService.error('Error Saving Shift');
    }
  }

  async deleteShift() {
    if (this.shift.id == null) {
      return;
    }

    const result = await this.dialogService.confirm(
      'Are you sure you want to delete this shift?', {
      title: 'Delete Shift?'
    }
    );

    if (result) {
      try {
        await this.shiftService.delete(this.shift.id);
        this.toastrService.success('Shift Deleted!');
        this.router.navigate(['/shift']);
      } catch (error) {
        this.toastrService.error('Error Deleting Shift');
      }
    }
  }
}
