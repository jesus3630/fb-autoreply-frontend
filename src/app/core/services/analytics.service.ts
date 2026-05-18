import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Stats {
  total: number;
  thisMonth: number;
  today: number;
}

export interface ReplyLog {
  id: string;
  accountId: string;
  conversationId: string;
  buyerName: string | null;
  messagePreview: string | null;
  templateContent: string;
  repliedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStats() {
    return this.http.get<Stats>(`${this.api}/analytics/stats`);
  }

  getLogs(accountId: string, limit = 50) {
    return this.http.get<ReplyLog[]>(`${this.api}/analytics/logs/${accountId}?limit=${limit}`);
  }
}
