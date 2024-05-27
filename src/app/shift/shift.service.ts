import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { objectToQueryString } from '../utils/object-to-query-string';

export type Bucket = 'year' | 'month' | 'day';

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

export type DateRange = 'thismonth' | 'thisyear' | 'lastmonth' | 'mtd' | 'ytd' | 'last12months' | 'lastyear' | 'custom';

export type ShiftFilter = {
  dateRange: DateRange | null,
  dateRangeDates: Date[] | null,
  jobIds: string[]
};

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  constructor(
    private httpClient: HttpClient
  ) { }

  static AGGREGATE_FIELDS = ['amount', 'sales', 'wages', 'hours'];

  async getOverview(filter: any, bucket: Bucket, withPrior: boolean): Promise<OverviewData> {
    // get current year data
    const currentPeriodData = await this.queryOverviewData(filter, bucket);

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

    const overview = {
      series: Array.from(seriesMap.values()),
      totals: {
        amount: currentPeriodData.totals.amount_sum,
        sales: currentPeriodData.totals.sales_sum,
        hours: currentPeriodData.totals.hours_sum,
        wages: currentPeriodData.totals.wages_sum,
        tipRate: currentPeriodData.totals.amount_sum / currentPeriodData.totals.hours_sum,
        tipPercent: currentPeriodData.totals.amount_sum / currentPeriodData.totals.sales_sum * 100,
        prior_amount: 0,
        prior_sales: 0,
        prior_hours: 0,
        prior_wages: 0,
        prior_tipRate: 0,
        prior_tipPercent: 0,
      }
    };

    if (withPrior && filter.dateRange) {
      const priorFilter: ShiftFilter = {
        dateRange: filter.dateRange,
        dateRangeDates: null,
        jobIds: filter.jobIds
      };

      if (Array.isArray(filter.dateRangeDates)) {
        priorFilter.dateRangeDates = filter.dateRangeDates.map((date: Date) => {
          return DateTime.fromJSDate(date).minus({ year: 1 }).toJSDate();
        })
      }

      const priorPeriodData = await this.queryOverviewData(priorFilter, bucket);

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

      overview.totals.prior_amount = priorPeriodData.totals.amount_sum;
      overview.totals.prior_sales = priorPeriodData.totals.sales_sum;
      overview.totals.prior_hours = priorPeriodData.totals.hours_sum;
      overview.totals.prior_wages = priorPeriodData.totals.wages_sum;
      overview.totals.prior_tipRate = priorPeriodData.totals.amount_sum / priorPeriodData.totals.hours_sum;
      overview.totals.prior_tipPercent = priorPeriodData.totals.amount_sum / priorPeriodData.totals.sales_sum * 100;
    }

    return overview;
  }

  private async queryOverviewData(filter: ShiftFilter, bucket: Bucket): Promise<PeriodData> {
    const totalsQuery = {
      aggregates: ShiftService.AGGREGATE_FIELDS.map((field) => ({
        field,
        aggregate: 'sum'
      })),
      filter: {
        logic: 'and',
        filters: [] as any[]
      }
    };

    if (filter.dateRangeDates) {
      totalsQuery.filter.filters.push({
        field: 'date',
        operator: 'gte',
        value: DateTime.fromJSDate(filter.dateRangeDates[0]).toFormat('yyyy-MM-dd')
      })

      totalsQuery.filter.filters.push({
        field: 'date',
        operator: 'lt',
        value: DateTime.fromJSDate(filter.dateRangeDates[1]).toFormat('yyyy-MM-dd'),
      });
    }

    if (filter.jobIds.length > 0) {
      totalsQuery.filter.filters.push({
        field: 'jobId',
        operator: 'in',
        value: filter.jobIds.join(',')
      });
    }

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

    payload.date = DateTime.fromJSDate(shift.date).toFormat('yyyy-MM-dd');
    const clockIn = new Date(`${payload.date}T${DateTime.fromJSDate(shift.clockIn).toUTC().toFormat('HH:mm:ss')}Z`);
    let clockOut = new Date(`${payload.date}T${DateTime.fromJSDate(shift.clockOut).toUTC().toFormat('HH:mm:ss')}Z`);
    if (clockOut < clockIn) {
      clockOut = new Date(clockOut.getTime() + 24 * 60 * 60 * 1000);
    }

    payload.clockIn = clockIn.toISOString();
    payload.clockOut = clockOut.toISOString();

    console.log(payload);

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
