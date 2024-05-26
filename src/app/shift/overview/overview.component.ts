import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';

import { OverviewData, ShiftService } from '../shift.service';
import { OverviewPanelComponent } from '../overview-panel/overview-panel.component';

@Component({
  selector: 'ts-overview',
  standalone: true,
  imports: [
    CommonModule,
    OverviewPanelComponent,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
  overview?: OverviewData;

  filter = {};

  fromDate!: Date;
  toDate!: Date;

  constructor(
    private shiftService: ShiftService
  ) {}

  async ngOnInit() {
    this.fromDate = DateTime.now().startOf('year').toJSDate();
    this.toDate = DateTime.now().endOf('month').toJSDate();

    await this.loadOverview();
  }

  async loadOverview() {
    this.overview = await this.shiftService.getOverview(
      this.fromDate,
      this.toDate,
      'month'
    );
  }
}
