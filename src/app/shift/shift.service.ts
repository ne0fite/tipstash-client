import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { objectToQueryString } from '../utils/object-to-query-string';

export type Bucket = 'day' | 'month';

export type PeriodDataItem = {
  bucket: string;
  amount_sum: number;
  sales_sum: number;
  wages_sum: number;
  hours_sum: number;
};

export type PeriodData = {
  series: PeriodDataItem[];
  totals: {
    amount_sum: number;
    sales_sum: number;
    wages_sum: number;
    hours_sum: number;
  };
};

export type DataItem = {
  [key: string]: number | Date | undefined;
  date: Date;
  amount: number;
  sales: number;
  wages: number;
  hours: number;
  tipRate: number;
  tipPercent: number;
  prior_amount?: number;
  prior_sales?: number;
  prior_wages?: number;
  prior_hours?: number;
  prior_tipRate?: number;
  prior_tipPercent?: number;
};

export type OverviewTotals = {
  current: DataItem;
  prior: DataItem;
};

export type OverviewData = {
  series: DataItem[];
  totals: {
    [key: string]: number;
    amount: number;
    sales: number;
    wages: number;
    hours: number;
    tipRate: number;
    tipPercent: number;
    prior_amount: number;
    prior_sales: number;
    prior_wages: number;
    prior_hours: number;
    prior_tipRate: number;
    prior_tipPercent: number;
  };
};

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  constructor(
    private httpClient: HttpClient
  ) { }

  static AGGREGATE_FIELDS = ['amount', 'sales', 'wages', 'hours'];

  async getOverview(from: Date, to: Date, bucket: Bucket): Promise<OverviewData> {
    // get current year data
    const currentPeriodData = await this.queryOverviewData(from, to, bucket);

    // get prior year data for comparison
    const priorFrom = DateTime.fromJSDate(from).minus({ year: 1 }).toJSDate();
    const priorTo = DateTime.fromJSDate(to).minus({ year: 1 }).toJSDate();
    const priorPeriodData = await this.queryOverviewData(priorFrom, priorTo, bucket);

    const seriesMap = new Map<string, DataItem>();

    for (const currentPeriodItem of currentPeriodData.series) {
      const dataItem = {
        date: new Date(currentPeriodItem.bucket),
        amount: currentPeriodItem.amount_sum,
        sales: currentPeriodItem.sales_sum,
        hours: currentPeriodItem.hours_sum,
        wages: currentPeriodItem.wages_sum,
        tipRate: currentPeriodItem.amount_sum / currentPeriodItem.hours_sum,
        tipPercent: currentPeriodItem.amount_sum / currentPeriodItem.sales_sum * 100,
      }

      seriesMap.set(new Date(currentPeriodItem.bucket).toISOString(), dataItem);
    }

    for (const priorPeriodItem of priorPeriodData.series) {
      const priorBucketDate = new Date(priorPeriodItem.bucket);
      const currentBucketDate = DateTime.fromJSDate(priorBucketDate).plus({ year: 1 }).toJSDate();
      if (!currentBucketDate) {
        continue;
      }

      const dataItem = seriesMap.get(currentBucketDate.toISOString());
      if (!dataItem) {
        continue;
      }

      dataItem.prior_amount = priorPeriodItem.amount_sum;
      dataItem.prior_sales = priorPeriodItem.sales_sum;
      dataItem.prior_hours = priorPeriodItem.hours_sum;
      dataItem.prior_wages = priorPeriodItem.wages_sum;
      dataItem.prior_tipRate = priorPeriodItem.amount_sum / priorPeriodItem.hours_sum;
      dataItem.prior_tipPercent = priorPeriodItem.amount_sum / priorPeriodItem.sales_sum * 100;
    }

    const overview = {
      series: Array.from(seriesMap.values()),
      totals: {
        amount: currentPeriodData.totals.amount_sum,
        sales: currentPeriodData.totals.sales_sum,
        hours: currentPeriodData.totals.hours_sum,
        wages: currentPeriodData.totals.wages_sum,
        tipRate: currentPeriodData.totals.amount_sum / currentPeriodData.totals.hours_sum,
        tipPercent: currentPeriodData.totals.amount_sum / currentPeriodData.totals.sales_sum * 100,
        prior_amount: priorPeriodData.totals.amount_sum,
        prior_sales: priorPeriodData.totals.sales_sum,
        prior_hours: priorPeriodData.totals.hours_sum,
        prior_wages: priorPeriodData.totals.wages_sum,
        prior_tipRate: priorPeriodData.totals.amount_sum / priorPeriodData.totals.hours_sum,
        prior_tipPercent: priorPeriodData.totals.amount_sum / priorPeriodData.totals.sales_sum * 100,
      }
    };

    return overview;
  }

  private async queryOverviewData(from: Date, to: Date, bucket: 'day' | 'month'): Promise<PeriodData> {
    const totalsQuery = {
      aggregates: ShiftService.AGGREGATE_FIELDS.map((field) => ({
        field,
        aggregate: 'sum'
      })),
      filter: {
        logic: 'and',
        filters: [{
          field: 'date',
          operator: 'gte',
          value: from.toISOString(),
        }, {
          field: 'date',
          operator: 'lte',
          value: to.toISOString(),
        }]
      }
    };

    const seriesQuery = {
      ...totalsQuery,
      bucket,
      sort: [
        {
          field: 'bucket',
          dir: 'asc'
        }
      ],
      take: 50,
    };

    const seriesQueryString = objectToQueryString(seriesQuery);

    const seriesObservable = this.httpClient.get<any>(
      `${environment.apiUrl}/api/v1/shift?${seriesQueryString}`
    );
    const { results: series } = await firstValueFrom(seriesObservable);

    const totalsQueryString = objectToQueryString(totalsQuery);
    const totalsObservable = this.httpClient.get<any>(
      `${environment.apiUrl}/api/v1/shift?${totalsQueryString}`
    );
    const { results: [totals] } = await firstValueFrom(totalsObservable);

    return { totals, series };
  }

  find(filters: any, sort: any, skip: number = 0, take: number = 50) {
    const query = {
      skip,
      take,
      sort: [sort],
    } as any;

    const queryFilters = [];

    if (filters.dateRangeDates != null && filters.dateRangeDates.length > 0) {
      queryFilters.push({
        field: 'date',
        operator: 'gte',
        value: DateTime.fromJSDate(filters.dateRangeDates[0]).toFormat('yyyy-MM-dd')
      });
      queryFilters.push({
        field: 'date',
        operator: 'lte',
        value: DateTime.fromJSDate(filters.dateRangeDates[1]).toFormat('yyyy-MM-dd')
      });
    }

    if (filters.jobIds.length > 0) {
      queryFilters.push({
        field: 'jobId',
        operator: 'in',
        value: filters.jobIds.join(',')
      });
    }

    if (queryFilters.length > 0) {
      query.filter = {
        logic: 'and',
        filters: queryFilters
      }
    }

    const queryString = objectToQueryString(query);

    const url = `${environment.apiUrl}/api/v1/shift?${queryString}`;
    const observable = this.httpClient.get<any>(url);
    return firstValueFrom(observable);
  }

  async getById(id: string) {
    const url = `${environment.apiUrl}/api/v1/shift/${id}`;
    const observable = this.httpClient.get<any>(url);
    const shift = await firstValueFrom(observable);
    return shift;
  }

  async save(shift: any, id?: string) {
    let url = `${environment.apiUrl}/api/v1/shift`;
    if (id) {
      url += `/${id}`;
    }

    const payload = {
      ...shift
    };

    const observable = this.httpClient.post<any>(url, payload);
    const savedJob = await firstValueFrom(observable);

    return savedJob;
  }

  delete(id: string) {
    let url = `${environment.apiUrl}/api/v1/shift/${id}`;
    const observable = this.httpClient.delete<any>(url);
    return firstValueFrom(observable);
  }
}
