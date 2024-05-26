import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule, CurrencyPipe, formatCurrency, formatNumber, formatPercent } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';

import { Bucket, DataItem, OverviewData } from '../shift.service';
import { ChartComponent } from '../chart/chart.component';

@Component({
  selector: 'ts-overview-panel',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    CurrencyPipe,
    ChartComponent,
  ],
  templateUrl: './overview-panel.component.html',
  styleUrl: './overview-panel.component.scss'
})
export class OverviewPanelComponent implements OnChanges {
  @Input({ required: true }) title!: string;
  @Input() format: string = 'd';
  @Input({ required: true }) overview!: OverviewData;
  @Input({ required: true }) field!: string;
  @Input() withPrior: boolean = false;
  @Input() bucket: Bucket = 'month';

  currentValue: string = '';
  priorValue: string = '';
  change: string = '';
  series: DataItem[] = [];

  changeClass = {
    'text-success': true,
    'text-danger': false
  };

  changeArrow = faCaretUp;

  ngOnChanges() {
    let formatter;
    switch (this.format) {
      case 'c':
        formatter = (value: number) => formatCurrency(value, 'en-us', '$');
        break;
      case 'p':
        formatter = (value: number) => formatPercent(value / 100, 'en-us', '1.0-2');
        break;
      case 'n':
      default:
        formatter = (value: number) => formatNumber(value, 'en-us');
        break;
    }

    const currentValue: number = this.overview.totals[this.field];
    const priorValue: number = this.overview.totals[`prior_${this.field}`];
    const change = Math.abs(currentValue - priorValue) / priorValue * 100;

    this.currentValue = formatter(currentValue);
    this.priorValue = formatter(priorValue);

    this.change = formatPercent(change / 100, 'en-us', '1.0-2');

    if (currentValue >= priorValue) {
      this.changeArrow = faCaretUp;
      this.changeClass = {
        'text-success': true,
        'text-danger': false
      };
    } else {
      this.changeArrow = faCaretDown;
      this.changeClass = {
        'text-success': false,
        'text-danger': true
      };
    }

    this.series = this.overview.series;
  }

  formatCurrency() {

  }
}
