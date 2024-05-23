import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  constructor(
    private httpClient: HttpClient
  ) { }

  find() {
    const url = `${environment.apiUrl}/api/v1/job`;
    const observable = this.httpClient.get<any>(url);
    return firstValueFrom(observable);
  }

  async getById(id: string) {
    const url = `${environment.apiUrl}/api/v1/job/${id}`;
    const observable = this.httpClient.get<any>(url);
    const job = await firstValueFrom(observable);
    this.updateDates(job);
    return job;
  }

  async save(job: any, id?: string) {
    let url = `${environment.apiUrl}/api/v1/job`;
    if (id) {
      url += `/${id}`;
    }

    const payload = {
      ...job,
      defaultClockIn: DateTime.fromJSDate(job.defaultClockIn).toFormat('HH:mm'),
      defaultClockOut: DateTime.fromJSDate(job.defaultClockOut).toFormat('HH:mm')
    };

    const observable = this.httpClient.post<any>(url, payload);
    const savedJob = await firstValueFrom(observable);

    this.updateDates(savedJob);

    return savedJob;
  }

  delete(id: string) {
    let url = `${environment.apiUrl}/api/v1/job/${id}`;
    const observable = this.httpClient.delete<any>(url);
    return firstValueFrom(observable);
  }

  updateDates(job: any) {
    job.defaultClockIn = new Date(`${DateTime.now().toFormat('yyyy-MM-dd')}T${job.defaultClockIn}`);
    job.defaultClockOut = new Date(`${DateTime.now().toFormat('yyyy-MM-dd')}T${job.defaultClockOut}`);
  }
}
