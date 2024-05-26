import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateTime } from 'luxon';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { JobService } from '../../job/job.service';

@Component({
  selector: 'ts-filter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    ButtonModule,
    CalendarModule,
    DropdownModule,
    MultiSelectModule,
  ],
  templateUrl: './filter-dialog.component.html',
  styleUrl: './filter-dialog.component.scss'
})
export class FilterDialogComponent implements OnInit {
  filterForm = this.formBuilder.group({
    dateRange: new FormControl(null as string | null),
    dateRangeDates: new FormControl([] as Date[]),
    jobIds: new FormControl([] as string[]),
  });

  filters = {
    dateRange: null as string | null,
    dateRangeDates: [] as Date[] | null,
    jobIds: [] as string[],
  };

  result = false;

  dateRangeOptions = [{
    label: 'All Dates',
    value: null,
  }, {
    label: 'This Month',
    value: 'thismonth',
  }, {
    label: 'This Year',
    value: 'thisyear',
  }, {
    label: 'Last Month',
    value: 'lastmonth',
  }, {
    label: 'Month to Date',
    value: 'mtd',
  }, {
    label: 'Year to Date',
    value: 'ytd',
  }, {
    label: 'Last 12 Months',
    value: 'last12months',
  }, {
    label: 'Last Year',
    value: 'lastyear',
  }, {
    label: 'Custom',
    value: 'custom',
  }]

  jobs = [];

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private jobService: JobService,
  ) {}

  async ngOnInit() {
    this.jobs = await this.jobService.find();

    this.filterForm.patchValue({
      ...this.filters
    });
  }

  clear() {
    this.filterForm.patchValue({
      dateRange: null,
      dateRangeDates: null,
      jobIds: [],
    });
  }

  apply() {
    const { dateRange } = this.filterForm.value;
    this.filters.dateRange = dateRange || null;
    if (dateRange != null) {
      // filter by a date range
      if (dateRange !== 'custom') {
        // create the date range from the selected date range preset
        this.filters.dateRangeDates = this.getDateRange(dateRange);
      } else {
        this.filters.dateRangeDates = this.filterForm.value.dateRangeDates || null;
      }
    } else {
      // show all dates
      this.filters.dateRangeDates = null;
    }

    this.filters.jobIds = this.filterForm.value.jobIds || [];

    this.result = true;

    this.bsModalRef.hide();
  }

  cancel() {
    this.bsModalRef.hide();
  }

  getDateRange(dateRange: string): Date[] | null {
    const startDate = DateTime.fromJSDate(new Date()).toLocal();
    const endDate = DateTime.fromJSDate(new Date()).toLocal();
    switch (dateRange) {
      case 'thismonth':
        return [
          startDate.startOf('month').toJSDate(),
          endDate.endOf('month').toJSDate(),
        ];
      case 'thisyear':
        return [
          startDate.startOf('year').toJSDate(),
          endDate.endOf('year').toJSDate(),
        ];
      case 'lastmonth':
        return [
          startDate.startOf('month').minus({ months: 1 }).toJSDate(),
          endDate.endOf('month').minus({ months: 1 }).toJSDate(),
        ];
      case 'mtd':
        return [
          startDate.startOf('month').toJSDate(),
          endDate.endOf('month').toJSDate(),
        ];
      case 'ytd':
        return [
          startDate.startOf('year').toJSDate(),
          endDate.endOf('month').toJSDate(),
        ];
      case 'last12months':
        return [
          startDate.startOf('month').minus({ months: 11 }).toJSDate(),
          endDate.endOf('month').toJSDate(),
        ];
      case 'lastyear':
        return [
          startDate.startOf('year').minus({ years: 1 }).toJSDate(),
          endDate.endOf('year').minus({ years: 1 }).toJSDate(),
        ];
    }
    return null;
  }
}
