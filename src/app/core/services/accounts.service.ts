import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface FbAccount {
  id: string;
  label: string;
  status: string;
  isActive: boolean;
  isRunning: boolean;
  hasCookies: boolean;
  lastError: string | null;
  lastSeenAt: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AccountsService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<FbAccount[]>(`${this.api}/accounts`);
  }

  create(label: string) {
    return this.http.post<FbAccount>(`${this.api}/accounts`, { label });
  }

  remove(id: string) {
    return this.http.delete(`${this.api}/accounts/${id}`);
  }

  getBotStatus() {
    return this.http.get<FbAccount[]>(`${this.api}/bots/status`);
  }

  startBot(accountId: string) {
    return this.http.post(`${this.api}/bots/${accountId}/start`, {});
  }

  stopBot(accountId: string) {
    return this.http.post(`${this.api}/bots/${accountId}/stop`, {});
  }

  updateCookies(accountId: string, cookies: string) {
    return this.http.patch(`${this.api}/accounts/${accountId}/cookies`, { cookies });
  }
}
