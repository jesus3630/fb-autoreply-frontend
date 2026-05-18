import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  checkout(priceId: string) {
    return this.http.post<{ url: string }>(`${this.api}/billing/checkout`, { priceId });
  }

  portal() {
    return this.http.post<{ url: string }>(`${this.api}/billing/portal`, {});
  }
}
