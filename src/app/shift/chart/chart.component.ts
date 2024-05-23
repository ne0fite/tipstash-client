import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DateTime } from 'luxon';
import Chart, { Legend } from 'chart.js/auto';
import { DataItem } from '../shift.service';

@Component({
  selector: 'ts-chart',
  standalone: true,
  imports: [],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) data!: DataItem[];
  @Input({ required: true }) field!: string;
  @Input({ required: true }) bucket!: 'day' | 'month';

  chartId!: string;

  chart!: Chart | null;

  constructor() {
    this.chartId = `${this.field}-chart`;
  }

  ngAfterViewInit() {
    this.renderChart();
  }

  ngOnChanges() {
    this.chartId = `${this.field}-chart`;
    if (this.chart) {
      this.chart.destroy();
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  renderChart() {
    const labels = [];
    const currentSeriesData: number[] = [];
    const priorSeriesData: (number | null)[] = [];

    let bucketDateFormat;
    if (this.bucket === 'day') {
      bucketDateFormat = 'M/d/yyyy';
    } else {
      bucketDateFormat = 'MMM';
    }

    for (const dataItem of this.data) {
      const bucketDate = new Date(dataItem.date);
      labels.push(DateTime.fromJSDate(bucketDate).toFormat(bucketDateFormat));
      currentSeriesData.push(dataItem[this.field] as number);

      const priorFieldName = `prior_${this.field}`;
      priorSeriesData.push((dataItem[priorFieldName] || 0) as number);
    }

    this.chart = new Chart(this.chartId, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: "Current Year",
            data: currentSeriesData,
            backgroundColor: 'blue'
          },
          {
            label: "Prior Year",
            data: priorSeriesData,
            backgroundColor: 'grey'
          }
        ]
      },
      options: {
        aspectRatio: 2.5,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
}
