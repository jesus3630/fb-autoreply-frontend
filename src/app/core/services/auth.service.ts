import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  tier: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;
  user = signal<AuthUser | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

  register(email: string, password: string, name: string) {
    return this.http.post<{ access_token: string; user: AuthUser }>(`${this.api}/auth/register`, { email, password, name }).pipe(
      tap((res) => this.saveSession(res))
    );
  }

  login(email: string, password: string) {
    return this.http.post<{ access_token: string; user: AuthUser }>(`${this.api}/auth/login`, { email, password }).pipe(
      tap((res) => this.saveSession(res))
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private saveSession(res: { access_token: string; user: AuthUser }) {
    localStorage.setItem('token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.user.set(res.user);
    this.router.navigate(['/dashboard']);
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
}
