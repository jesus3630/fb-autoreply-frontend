import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoginSessionService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  start(accountId: string) {
    return this.http.post(`${this.api}/accounts/${accountId}/login-session`, {});
  }

  getScreenshot(accountId: string): Observable<string> {
    return this.http
      .get(`${this.api}/accounts/${accountId}/login-session/screenshot`, { responseType: 'blob' })
      .pipe(switchMap((blob) => from(this.blobToDataUrl(blob))));
  }

  click(accountId: string, x: number, y: number) {
    return this.http.post(`${this.api}/accounts/${accountId}/login-session/click`, { x, y });
  }

  type(accountId: string, text: string) {
    return this.http.post(`${this.api}/accounts/${accountId}/login-session/type`, { text });
  }

  press(accountId: string, key: string) {
    return this.http.post(`${this.api}/accounts/${accountId}/login-session/press`, { key });
  }

  getStatus(accountId: string) {
    return this.http.get<{ loggedIn: boolean; url: string }>(
      `${this.api}/accounts/${accountId}/login-session/status`,
    );
  }

  close(accountId: string) {
    return this.http.delete(`${this.api}/accounts/${accountId}/login-session`);
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.readAsDataURL(blob);
    });
  }
}
