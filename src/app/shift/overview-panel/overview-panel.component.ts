import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Bucket, DataItem, OverviewData } from '../shift.service';
import { CurrencyPipe, formatCurrency, formatNumber, formatPercent } from '@angular/common';
import { ChartComponent } from '../chart/chart.component';

@Component({
  selector: 'ts-overview-panel',
  standalone: true,
  imports: [
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

  currentValue!: string;
  priorValue!: string;
  series: DataItem[] = [];

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

    this.currentValue = formatter(this.overview.totals[this.field]);
    this.priorValue = formatter(this.overview.totals[`prior_${this.field}`]);
    this.series = this.overview.series;
  }

  formatCurrency() {

  }
}
