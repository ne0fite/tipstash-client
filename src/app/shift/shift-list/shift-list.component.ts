import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUp, faArrowDown, faSliders } from '@fortawesome/free-solid-svg-icons';

import * as Constants from '../../constants';
import { ShiftService } from '../shift.service';
import { ShiftCardComponent } from '../shift-card/shift-card.component';
import { ButtonModule } from 'primeng/button';
import { FilterDialogComponent } from '../filter-dialog/filter-dialog.component';
import { DialogService } from '../../dialog/dialog.service';

@Component({
  selector: 'ts-shift-list',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    DecimalPipe,

    ButtonModule,

    ShiftCardComponent
  ],
  templateUrl: './shift-list.component.html',
  styleUrl: './shift-list.component.scss'
})
export class ShiftListComponent {
  faSliders = faSliders;

  totalRows = 0;
  shifts: any[] = [];

  filters = {
    dateRange: null,
    dateRangeDates: null,
    jobIds: []
  };

  numFilters?: string;

  sortDirection = 'desc';
  sortArrowIcon = faArrowDown;

  lastOffset: number | null = null;
  pageSize = 50;

  constructor(
    private dialogService: DialogService,
    private shiftService: ShiftService
  ) { }

  async ngOnInit() {
    this.loadState();
    this.updateNumFilters();
    await this.loadNextPage();
  }

  loadState() {
    const savedStateJson = localStorage.getItem(Constants.LS_SHIFT_LIST_STATE);
    if (savedStateJson) {
      try {
        const savedState = JSON.parse(savedStateJson);
        console.log(savedState);
        const savedFilters = savedState.filters;
        if (Array.isArray(savedFilters.dateRangeDates)) {
          for (let i = 0; i < savedFilters.dateRangeDates.length; i++) {
            savedFilters.dateRangeDates[i] = new Date(savedFilters.dateRangeDates[i]);
          }
        }
        this.filters = {
          ...savedFilters
        };
        this.sortDirection = savedState.sortDirection;
      } catch {
        // no-op
      }
    }
  }

  saveState() {
    const state = {
      filters: this.filters,
      sortDirection: this.sortDirection
    };
    localStorage.setItem(Constants.LS_SHIFT_LIST_STATE, JSON.stringify(state));
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

  async loadNextPage() {
    const sort = {
      field: 'date',
      dir: this.sortDirection,
    };

    if (this.lastOffset == null) {
      // starting from the beginning
      this.lastOffset = 0;
    } else {
      // get next page of data
      this.lastOffset += this.pageSize;
    }

    const response = await this.shiftService.find(this.filters, sort, this.lastOffset, this.pageSize);
    this.shifts = this.shifts.concat(response.results);
    this.totalRows = response.totalRows;
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

      // filters changed - go back to top
      this.lastOffset = null;
      this.shifts = [];

      // query the shifts
      await this.loadNextPage();
    }
  }

  async toggleSortDirection(event: any) {
    event.preventDefault();
    if (this.sortDirection === 'asc') {
      this.sortDirection = 'desc';
      this.sortArrowIcon = faArrowDown;
    } else {
      this.sortDirection = 'asc';
      this.sortArrowIcon = faArrowUp;
    }

    // sort changed - go back to top
    this.lastOffset = null;
    this.shifts = [];

    this.saveState();

    await this.loadNextPage();
  }
}
