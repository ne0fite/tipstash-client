import { Component, OnInit } from '@angular/core';
import { OverviewData, ShiftService } from '../shift.service';
import { OverviewPanelComponent } from '../overview-panel/overview-panel.component';
import { CommonModule } from '@angular/common';

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

  constructor(
    private shiftService: ShiftService
  ) {}

  async ngOnInit() {
    await this.loadOverview();
  }

  async loadOverview() {
    this.overview = await this.shiftService.getOverview(
      new Date('2018-01-01T05:00:00Z'),
      new Date('2019-01-01T05:00:00Z'),
      'month'
    );
    console.log(this.overview);
  }
}
