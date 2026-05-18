import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AnalyticsService, Stats, ReplyLog } from '../../core/services/analytics.service';
import { AccountsService, FbAccount } from '../../core/services/accounts.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, MatTableModule, MatProgressSpinnerModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Analytics</h1>
        <p>Reply activity across all your accounts.</p>
      </div>

      <div class="stats-row">
        <mat-card class="stat-card"><div class="stat-val">{{ stats?.today ?? '—' }}</div><div class="stat-label">Today</div></mat-card>
        <mat-card class="stat-card"><div class="stat-val">{{ stats?.thisMonth ?? '—' }}</div><div class="stat-label">This month</div></mat-card>
        <mat-card class="stat-card"><div class="stat-val">{{ stats?.total ?? '—' }}</div><div class="stat-label">All time</div></mat-card>
      </div>

      @if (accounts.length > 0) {
        <mat-card class="logs-card">
          <div class="logs-header">
            <h3>Reply Log</h3>
            <mat-select [formControl]="accountCtrl" placeholder="Select account" (selectionChange)="loadLogs()">
              @for (a of accounts; track a.id) {
                <mat-option [value]="a.id">{{ a.label }}</mat-option>
              }
            </mat-select>
          </div>

          @if (logsLoading) {
            <div class="center"><mat-spinner diameter="36" /></div>
          } @else if (logs.length === 0 && accountCtrl.value) {
            <div class="empty">No replies logged yet for this account.</div>
          } @else if (logs.length > 0) {
            <table mat-table [dataSource]="logs" class="log-table">
              <ng-container matColumnDef="when">
                <th mat-header-cell *matHeaderCellDef>When</th>
                <td mat-cell *matCellDef="let log">{{ log.repliedAt | date:'MMM d, h:mm a' }}</td>
              </ng-container>
              <ng-container matColumnDef="buyer">
                <th mat-header-cell *matHeaderCellDef>Buyer</th>
                <td mat-cell *matCellDef="let log">{{ log.buyerName || '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="message">
                <th mat-header-cell *matHeaderCellDef>Their message</th>
                <td mat-cell *matCellDef="let log" class="preview">{{ log.messagePreview || '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="reply">
                <th mat-header-cell *matHeaderCellDef>Reply sent</th>
                <td mat-cell *matCellDef="let log" class="preview">{{ log.templateContent }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;"></tr>
            </table>
          }
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 1000px; }
    .page-header { margin-bottom: 24px; }
    h1 { margin: 0 0 4px; font-size: 26px; }
    p { margin: 0; color: #666; }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { padding: 24px; text-align: center; }
    .stat-val { font-size: 36px; font-weight: 700; color: #4f8ef7; }
    .stat-label { font-size: 13px; color: #888; margin-top: 4px; }
    .logs-card { padding: 20px; }
    .logs-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .logs-header h3 { margin: 0; }
    .logs-header mat-select { width: 220px; }
    .center { display: flex; justify-content: center; padding: 32px; }
    .empty { text-align: center; padding: 32px; color: #aaa; }
    .log-table { width: 100%; }
    .preview { max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 13px; }
  `]
})
export class Analytics implements OnInit {
  stats: Stats | null = null;
  accounts: FbAccount[] = [];
  logs: ReplyLog[] = [];
  logsLoading = false;
  cols = ['when', 'buyer', 'message', 'reply'];
  accountCtrl = new FormControl<string | null>(null);

  constructor(private analyticsService: AnalyticsService, private accountsService: AccountsService) {}

  ngOnInit() {
    this.analyticsService.getStats().subscribe((s) => (this.stats = s));
    this.accountsService.getAll().subscribe((a) => { this.accounts = a; if (a.length) { this.accountCtrl.setValue(a[0].id); this.loadLogs(); } });
  }

  loadLogs() {
    if (!this.accountCtrl.value) return;
    this.logsLoading = true;
    this.analyticsService.getLogs(this.accountCtrl.value).subscribe({ next: (l) => { this.logs = l; this.logsLoading = false; }, error: () => (this.logsLoading = false) });
  }
}
