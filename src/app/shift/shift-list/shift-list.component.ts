import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUp, faArrowDown, faSliders } from '@fortawesome/free-solid-svg-icons';

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
    await this.loadNextPage();
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
      // update the filter count badge
      let numFilters = 0;
      if (this.filters.dateRange != null) {
        numFilters++;
      }
      if (this.filters.jobIds.length > 0) {
        numFilters++;
      }
      this.numFilters = numFilters > 0 ? numFilters.toString() : undefined;

      // copy the applied filters
      this.filters = {
        ...result.filters
      }

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

    await this.loadNextPage();
  }
}
