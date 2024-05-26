import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';

import * as Constants from '../../constants';
import { DialogService } from '../../dialog/dialog.service';
import { FilterDialogComponent } from '../filter-dialog/filter-dialog.component';
import { Bucket, OverviewData, ShiftFilter, ShiftService } from '../shift.service';
import { OverviewPanelComponent } from '../overview-panel/overview-panel.component';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

export type OverviewState = {
  filters: ShiftFilter,
  withPrior: boolean,
  bucket: Bucket,
};

@Component({
  selector: 'ts-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ButtonModule,
    DropdownModule,
    ToggleButtonModule,
    OverviewPanelComponent,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
  faSliders = faSliders;

  overview?: OverviewData;

  filters: ShiftFilter = {
    dateRange: null,
    dateRangeDates: null ,
    jobIds: []
  };

  numFilters?: string;

  withPrior = false;

  bucket: Bucket = 'month';

  bucketOptions = [{
    label: 'Days',
    value: 'day'
  }, {
    label: 'Months',
    value: 'month'
  }, {
    label: 'Years',
    value: 'year'
  }]

  constructor(
    private dialogService: DialogService,
    private shiftService: ShiftService
  ) {}

  async ngOnInit() {
    this.loadState();
    this.updateNumFilters();
    await this.loadOverview();
  }

  async withPriorChanged() {
    this.saveState();
    await this.loadOverview();
  }

  async loadOverview() {
    this.overview = await this.shiftService.getOverview(this.filters, this.bucket, this.withPrior);
  }

  async filterShifts() {
    const result = await this.dialogService.show(
      FilterDialogComponent, {
      initialState: {
        filters: this.filters,
      }
    });

    if (result.result) {
      this.updateNumFilters();

      // copy the applied filters
      this.filters = {
        ...result.filters
      }

      this.saveState();

      await this.loadOverview();
    }
  }

  loadState() {
    const savedStateJson = localStorage.getItem(Constants.LS_OVERVIEW_STATE);
    if (savedStateJson) {
      try {
        const savedState: OverviewState = JSON.parse(savedStateJson);
        // const savedState = {
        //   filters: {
        //     dateRange: 'custom',
        //     dateRangeDates: [
        //       new Date('2018-01-01T06:00:00Z'),
        //       new Date('2019-01-01T06:00:00Z')
        //     ],
        //     jobIds: [],
        //   },
        //   withPrior: false
        // } as OverviewState;

        const savedFilters = savedState.filters;
        if (Array.isArray(savedFilters.dateRangeDates)) {
          savedFilters.dateRangeDates = savedFilters.dateRangeDates.map((date) => new Date(date));
        }
        this.filters = {
          ...savedFilters
        };

        this.withPrior = savedState.withPrior || false;
        this.bucket = savedState.bucket || 'month';
      } catch {
        // no-op
      }
    }
  }

  saveState() {
    const state: OverviewState = {
      filters: this.filters,
      withPrior: this.withPrior,
      bucket: this.bucket,
    };
    localStorage.setItem(Constants.LS_OVERVIEW_STATE, JSON.stringify(state));
  }

  updateNumFilters() {
    // update the filter count badge
    let numFilters = 0;
    if (this.filters.dateRange != null) {
      numFilters++;
    }
    if (this.filters.jobIds.length > 0) {
      numFilters++;
    }
    this.numFilters = numFilters > 0 ? numFilters.toString() : undefined;
  }
}
