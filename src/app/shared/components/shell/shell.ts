import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="brand">
          <mat-icon>reply</mat-icon>
          <span>AutoReply</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/accounts" routerLinkActive="active">
            <mat-icon matListItemIcon>account_circle</mat-icon>
            <span matListItemTitle>Accounts</span>
          </a>
          <a mat-list-item routerLink="/templates" routerLinkActive="active">
            <mat-icon matListItemIcon>message</mat-icon>
            <span matListItemTitle>Templates</span>
          </a>
          <a mat-list-item routerLink="/analytics" routerLinkActive="active">
            <mat-icon matListItemIcon>bar_chart</mat-icon>
            <span matListItemTitle>Analytics</span>
          </a>
          <a mat-list-item routerLink="/pricing" routerLinkActive="active">
            <mat-icon matListItemIcon>upgrade</mat-icon>
            <span matListItemTitle>Upgrade</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <a mat-list-item routerLink="/settings">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Settings</span>
          </a>
          <button mat-list-item (click)="auth.logout()">
            <mat-icon matListItemIcon>logout</mat-icon>
            <span matListItemTitle>Logout</span>
          </button>
        </div>
      </mat-sidenav>
      <mat-sidenav-content class="main-content">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell { height: 100vh; }
    .sidenav { width: 220px; background: #1a1a2e; color: #fff; display: flex; flex-direction: column; }
    .brand { display: flex; align-items: center; gap: 10px; padding: 20px 16px 12px; font-size: 20px; font-weight: 700; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 8px; }
    .brand mat-icon { color: #4f8ef7; }
    mat-nav-list a, mat-nav-list button { color: rgba(255,255,255,0.7) !important; border-radius: 8px; margin: 2px 8px; }
    mat-nav-list a.active { background: rgba(79,142,247,0.2) !important; color: #4f8ef7 !important; }
    mat-nav-list a.active mat-icon { color: #4f8ef7 !important; }
    mat-nav-list mat-icon { color: rgba(255,255,255,0.5); }
    .sidenav-footer { margin-top: auto; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; }
    .main-content { background: #f5f6fa; overflow-y: auto; }
  `]
})
export class Shell {
  constructor(public auth: AuthService) {}
}
