import { Component, OnInit } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AnalyticsService, Stats } from '../../core/services/analytics.service';
import { AccountsService, FbAccount } from '../../core/services/accounts.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [UpperCasePipe, MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {{ auth.user()?.name || auth.user()?.email }}</p>
        </div>
        <span class="tier-badge" [class]="auth.user()?.tier">{{ auth.user()?.tier | uppercase }}</span>
      </div>

      <div class="stats-row">
        <mat-card class="stat-card">
          <mat-icon color="primary">reply_all</mat-icon>
          <div class="stat-val">{{ stats?.today ?? '—' }}</div>
          <div class="stat-label">Replies today</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon color="primary">calendar_month</mat-icon>
          <div class="stat-val">{{ stats?.thisMonth ?? '—' }}</div>
          <div class="stat-label">This month</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon color="primary">all_inclusive</mat-icon>
          <div class="stat-val">{{ stats?.total ?? '—' }}</div>
          <div class="stat-label">All time</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon color="accent">account_circle</mat-icon>
          <div class="stat-val">{{ runningCount }}</div>
          <div class="stat-label">Bots running</div>
        </mat-card>
      </div>

      <div class="cards-row">
        <mat-card class="action-card">
          <mat-icon>account_circle</mat-icon>
          <h3>Manage Accounts</h3>
          <p>Add Facebook accounts and start/stop your auto-reply bots.</p>
          <a mat-flat-button color="primary" routerLink="/accounts">Go to Accounts</a>
        </mat-card>
        <mat-card class="action-card">
          <mat-icon>message</mat-icon>
          <h3>Reply Templates</h3>
          <p>Customize the messages sent to buyers. Rotation is automatic.</p>
          <a mat-flat-button color="primary" routerLink="/templates">Edit Templates</a>
        </mat-card>
        <mat-card class="action-card">
          <mat-icon>bar_chart</mat-icon>
          <h3>Analytics</h3>
          <p>See every reply sent, which templates are working best.</p>
          <a mat-flat-button color="primary" routerLink="/analytics">View Analytics</a>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    h1 { margin: 0 0 4px; font-size: 26px; }
    p { margin: 0; color: #666; }
    .tier-badge { padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 1px; background: #e3eeff; color: #4f8ef7; }
    .tier-badge.pro { background: #e8f5e9; color: #2e7d32; }
    .tier-badge.business { background: #fff3e0; color: #e65100; }
    .tier-badge.agency { background: #f3e5f5; color: #6a1b9a; }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { padding: 20px; text-align: center; }
    .stat-card mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .stat-val { font-size: 32px; font-weight: 700; margin: 8px 0 4px; }
    .stat-label { font-size: 13px; color: #888; }
    .cards-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .action-card { padding: 24px; display: flex; flex-direction: column; gap: 8px; }
    .action-card mat-icon { font-size: 36px; width: 36px; height: 36px; color: #4f8ef7; }
    .action-card h3 { margin: 0; font-size: 16px; }
    .action-card p { margin: 0; font-size: 13px; color: #777; flex: 1; }
    .action-card a { align-self: flex-start; margin-top: 8px; }
  `]
})
export class Dashboard implements OnInit {
  stats: Stats | null = null;
  runningCount = 0;

  constructor(public auth: AuthService, private analyticsService: AnalyticsService, private accountsService: AccountsService) {}

  ngOnInit() {
    this.analyticsService.getStats().subscribe((s) => (this.stats = s));
    this.accountsService.getBotStatus().subscribe((accounts) => {
      this.runningCount = accounts.filter((a) => a.isRunning).length;
    });
  }
}
