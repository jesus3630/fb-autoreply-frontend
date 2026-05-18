import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatIconModule, MatButtonModule],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="brand">
          <mat-icon>reply</mat-icon>
          <span>AutoReply</span>
        </div>
        <nav class="nav-list">
          <a class="nav-item" routerLink="/dashboard" routerLinkActive="active">
            <mat-icon>dashboard</mat-icon><span>Dashboard</span>
          </a>
          <a class="nav-item" routerLink="/accounts" routerLinkActive="active">
            <mat-icon>account_circle</mat-icon><span>Accounts</span>
          </a>
          <a class="nav-item" routerLink="/templates" routerLinkActive="active">
            <mat-icon>message</mat-icon><span>Templates</span>
          </a>
          <a class="nav-item" routerLink="/analytics" routerLinkActive="active">
            <mat-icon>bar_chart</mat-icon><span>Analytics</span>
          </a>
          <a class="nav-item" routerLink="/pricing" routerLinkActive="active">
            <mat-icon>upgrade</mat-icon><span>Upgrade</span>
          </a>
        </nav>
        <div class="sidenav-footer">
          <a class="nav-item" routerLink="/settings" routerLinkActive="active">
            <mat-icon>settings</mat-icon><span>Settings</span>
          </a>
          <button class="nav-item" (click)="auth.logout()">
            <mat-icon>logout</mat-icon><span>Logout</span>
          </button>
        </div>
      </mat-sidenav>
      <mat-sidenav-content class="main-content">
        @if (sessionExpiringSoon) {
          <div class="session-banner">
            <mat-icon>warning</mat-icon>
            Your session expires soon. <button (click)="auth.logout()">Log out and back in</button> to stay connected.
          </div>
        }
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell { height: 100vh; }
    .sidenav { width: 220px; background: #1a1a2e; color: #fff; display: flex; flex-direction: column; }
    .brand { display: flex; align-items: center; gap: 10px; padding: 20px 16px 12px; font-size: 20px; font-weight: 700; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 8px; }
    .brand mat-icon { color: #4f8ef7; }
    .nav-list { display: flex; flex-direction: column; padding: 4px 8px; flex: 1; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; font-weight: 500; cursor: pointer; border: none; background: none; width: 100%; box-sizing: border-box; transition: background 0.15s; }
    .nav-item:hover { background: rgba(255,255,255,0.07); color: #fff; }
    .nav-item.active { background: rgba(79,142,247,0.2); color: #4f8ef7; }
    .nav-item.active mat-icon { color: #4f8ef7; }
    .nav-item mat-icon { color: rgba(255,255,255,0.5); font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
    .nav-item.active mat-icon, .nav-item:hover mat-icon { color: inherit; }
    .sidenav-footer { border-top: 1px solid rgba(255,255,255,0.1); padding: 8px; }
    .main-content { background: #f5f6fa; overflow-y: auto; display: flex; flex-direction: column; }
    .session-banner { background: #fff3cd; color: #856404; padding: 10px 20px; display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .session-banner mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .session-banner button { margin-left: 4px; background: none; border: none; color: #856404; font-weight: 600; cursor: pointer; text-decoration: underline; padding: 0; }
  `]
})
export class Shell implements OnInit {
  sessionExpiringSoon = false;

  constructor(public auth: AuthService) {}

  ngOnInit() {
    const token = this.auth.getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = payload.exp * 1000 - Date.now();
      // warn if less than 24 hours remain
      this.sessionExpiringSoon = expiresIn > 0 && expiresIn < 24 * 60 * 60 * 1000;
    } catch {}
  }
}
