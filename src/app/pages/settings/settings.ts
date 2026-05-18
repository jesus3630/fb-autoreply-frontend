import { Component } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BillingService } from '../../core/services/billing.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [UpperCasePipe, MatCardModule, MatButtonModule, MatIconModule, RouterLink, MatSnackBarModule],
  template: `
    <div class="page">
      <h1>Settings</h1>

      <mat-card class="section">
        <h3>Account</h3>
        <div class="info-row"><span class="label">Name</span><span>{{ auth.user()?.name || '—' }}</span></div>
        <div class="info-row"><span class="label">Email</span><span>{{ auth.user()?.email }}</span></div>
        <div class="info-row"><span class="label">Plan</span>
          <span class="tier-badge" [class]="auth.user()?.tier">{{ auth.user()?.tier | uppercase }}</span>
        </div>
        <div class="actions">
          <a mat-stroked-button routerLink="/pricing">Upgrade plan</a>
          <button mat-stroked-button (click)="openPortal()">Manage billing</button>
        </div>
      </mat-card>

      <mat-card class="section danger-zone">
        <h3>Session</h3>
        <button mat-stroked-button color="warn" (click)="auth.logout()">
          <mat-icon>logout</mat-icon> Sign out
        </button>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 600px; }
    h1 { margin: 0 0 24px; font-size: 26px; }
    .section { padding: 24px; margin-bottom: 20px; }
    .section h3 { margin: 0 0 16px; }
    .info-row { display: flex; align-items: center; gap: 16px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .info-row:last-of-type { border: none; }
    .label { color: #888; width: 80px; flex-shrink: 0; }
    .tier-badge { padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; background: #e3eeff; color: #4f8ef7; }
    .tier-badge.pro { background: #e8f5e9; color: #2e7d32; }
    .tier-badge.business { background: #fff3e0; color: #e65100; }
    .tier-badge.agency { background: #f3e5f5; color: #6a1b9a; }
    .actions { display: flex; gap: 12px; margin-top: 16px; }
  `]
})
export class Settings {
  constructor(public auth: AuthService, private billing: BillingService, private snack: MatSnackBar) {}

  openPortal() {
    this.billing.portal().subscribe({
      next: (res) => { window.location.href = res.url; },
      error: () => this.snack.open('No billing account found.', 'OK', { duration: 3000 })
    });
  }
}
