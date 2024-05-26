import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DateTime } from 'luxon';
import Chart from 'chart.js/auto';
import { Bucket, DataItem } from '../shift.service';

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
  @Input() bucket: Bucket = 'month'
  @Input() withPrior: boolean = false;
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

    const chartType = this.withPrior ? 'bar' : 'line';

    let bucketDateFormat;
    if (this.bucket === 'month') {
      if (this.data.length > 12) {
        bucketDateFormat = 'MMM yyyy';
      } else {
        bucketDateFormat = 'MMM';
      }
    } else if (this.bucket === 'year') {
      bucketDateFormat = 'yyyy';
    } else {
      if (this.data.length > 366) {
        bucketDateFormat = 'M/d/yyyy';
      } else if (this.data.length > 31) {
        bucketDateFormat = 'M/d';
      } else {
        bucketDateFormat = 'd';
      }
    }

    for (const dataItem of this.data) {
      const bucketDate = new Date(dataItem.date);
      // work date is date-only but comes from the server at midnight UTC
      labels.push(DateTime.fromJSDate(bucketDate).toUTC().toFormat(bucketDateFormat));
      currentSeriesData.push(dataItem[this.field] as number);

      const priorFieldName = `prior_${this.field}`;
      priorSeriesData.push((dataItem[priorFieldName] || 0) as number);
    }

    const datasets: any[] = [
      {
        label: "Current Year",
        data: currentSeriesData,
        borderColor: 'blue',
        // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
        backgroundColor: 'blue',
        cubicInterpolationMode: 'monotone',
      }
    ];

    if (this.withPrior) {
      datasets.push({
        label: "Prior Year",
        data: priorSeriesData,
        backgroundColor: 'grey'
      });
    }

    this.chart = new Chart(this.chartId, {
      type: chartType,
      data: {
        labels,
        datasets,
      },
      options: {
        aspectRatio: 2.5,
        plugins: {
          legend: {
            display: false
          }
        },
        responsive: true
      }
    });
  }
}
