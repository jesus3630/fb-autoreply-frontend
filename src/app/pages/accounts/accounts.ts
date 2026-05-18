import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AccountsService, FbAccount } from '../../core/services/accounts.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Facebook Accounts</h1>
          <p>Each account runs its own bot. Bots reply to Marketplace buyers automatically.</p>
        </div>
      </div>

      <mat-card class="add-card">
        <h3>Add Account</h3>
        <div class="add-row">
          <mat-form-field appearance="outline" class="label-field">
            <mat-label>Account label (e.g. "Main Account")</mat-label>
            <input matInput [formControl]="labelCtrl" (keydown.enter)="addAccount()" />
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="addAccount()" [disabled]="labelCtrl.invalid || adding">
            <mat-icon>add</mat-icon> Add
          </button>
        </div>
        @if (addError) { <p class="err">{{ addError }}</p> }
      </mat-card>

      @if (loading) {
        <div class="center"><mat-spinner diameter="40" /></div>
      } @else if (loadError) {
        <div class="empty">
          <mat-icon style="color:#e53935">error_outline</mat-icon>
          <p style="color:#e53935">{{ loadError }}</p>
          <button mat-stroked-button (click)="load(true)">Retry</button>
        </div>
      } @else if (accounts.length === 0) {
        <div class="empty">
          <mat-icon>account_circle</mat-icon>
          <p>No accounts yet. Add your first Facebook account above.</p>
        </div>
      } @else {
        <div class="accounts-list">
          @for (account of accounts; track account.id) {
            <mat-card class="account-card">
              <div class="account-top">
                <div class="account-info">
                  <mat-icon class="acct-icon">account_circle</mat-icon>
                  <div>
                    <div class="account-label">{{ account.label }}</div>
                    <div class="account-meta">Added {{ account.createdAt | date:'mediumDate' }}</div>
                    @if (account.lastError) { <div class="account-error">{{ account.lastError }}</div> }
                  </div>
                </div>
                <div class="account-actions">
                  <span class="status-chip" [class]="account.isRunning ? 'running' : account.status">
                    <span class="dot"></span>
                    {{ account.isRunning ? 'Running' : account.status }}
                  </span>
                  @if (!account.hasCookies) {
                    <span class="warn-hint"><mat-icon class="warn-icon">warning</mat-icon> No cookies</span>
                  }
                  @if (account.isRunning) {
                    <button mat-stroked-button color="warn" (click)="stopBot(account)" [disabled]="busy[account.id]">
                      <mat-icon>stop</mat-icon> Stop
                    </button>
                  } @else {
                    <button mat-flat-button color="primary" (click)="startBot(account)"
                      [disabled]="busy[account.id] || !account.hasCookies"
                      [matTooltip]="!account.hasCookies ? 'Paste cookies first' : ''">
                      <mat-icon>play_arrow</mat-icon> Start
                    </button>
                  }
                  <button mat-stroked-button (click)="toggleCookies(account.id)">
                    <mat-icon>cookie</mat-icon> {{ account.hasCookies ? 'Update Cookies' : 'Add Cookies' }}
                  </button>
                  <button mat-icon-button color="warn" (click)="remove(account)" [disabled]="busy[account.id]">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>

              @if (expandedId === account.id) {
                <div class="cookies-section">
                  <p class="cookies-help">
                    Export cookies from Facebook using <strong>EditThisCookie</strong> Chrome extension.
                    Click the Export button (checkmark icon) on facebook.com — it copies the JSON to clipboard.
                  </p>
                  <mat-form-field appearance="outline" class="cookies-field">
                    <mat-label>Paste cookie JSON array here</mat-label>
                    <textarea matInput rows="5" [formControl]="getCookieCtrl(account.id)"
                      placeholder='[{"name":"c_user","value":"...","domain":".facebook.com",...}]'></textarea>
                  </mat-form-field>
                  <div class="cookies-actions">
                    <button mat-flat-button color="primary" (click)="saveCookies(account)"
                      [disabled]="savingCookies[account.id] || !getCookieCtrl(account.id).value?.trim()">
                      @if (savingCookies[account.id]) { <mat-spinner diameter="16" /> } @else { <mat-icon>save</mat-icon> }
                      Save Cookies
                    </button>
                    <button mat-button (click)="expandedId = ''">Cancel</button>
                    @if (cookieError[account.id]) { <span class="err">{{ cookieError[account.id] }}</span> }
                  </div>
                </div>
              }
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 860px; }
    .page-header { margin-bottom: 24px; }
    h1 { margin: 0 0 4px; font-size: 26px; }
    p { margin: 0; color: #666; }
    .add-card { padding: 20px; margin-bottom: 24px; }
    .add-card h3 { margin: 0 0 16px; }
    .add-row { display: flex; gap: 12px; align-items: flex-start; }
    .label-field { flex: 1; }
    .add-row button { margin-top: 4px; height: 44px; }
    .err { color: #e53935; font-size: 13px; margin: 8px 0 0; }
    .center { display: flex; justify-content: center; padding: 40px; }
    .empty { text-align: center; padding: 48px; color: #aaa; }
    .empty mat-icon { font-size: 56px; width: 56px; height: 56px; display: block; margin: 0 auto 12px; }
    .accounts-list { display: flex; flex-direction: column; gap: 16px; }
    .account-card { padding: 0; overflow: hidden; }
    .account-top { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; flex-wrap: wrap; gap: 12px; }
    .account-info { display: flex; align-items: center; gap: 14px; }
    .acct-icon { font-size: 40px; width: 40px; height: 40px; color: #4f8ef7; }
    .account-label { font-weight: 600; font-size: 15px; }
    .account-meta { font-size: 12px; color: #999; }
    .account-error { font-size: 12px; color: #e53935; }
    .account-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .status-chip { display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #f0f0f0; color: #666; }
    .status-chip.running { background: #e8f5e9; color: #2e7d32; }
    .status-chip.error { background: #ffebee; color: #c62828; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    .warn-hint { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #f57c00; }
    .warn-icon { font-size: 16px; width: 16px; height: 16px; }
    .cookies-section { border-top: 1px solid #e0e0e0; padding: 20px; background: #fafafa; }
    .cookies-help { font-size: 13px; color: #666; margin: 0 0 16px; }
    .cookies-field { width: 100%; }
    .cookies-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 4px; }
    .cookies-actions .err { margin: 0; }
  `]
})
export class Accounts implements OnInit {
  accounts: FbAccount[] = [];
  loading = true;
  loadError = '';
  adding = false;
  addError = '';
  expandedId = '';
  busy: Record<string, boolean> = {};
  savingCookies: Record<string, boolean> = {};
  cookieError: Record<string, string> = {};
  labelCtrl = new FormControl('', Validators.required);
  private cookieCtrls: Record<string, FormControl> = {};

  constructor(private svc: AccountsService, private snack: MatSnackBar) {}

  ngOnInit() { this.load(true); }

  getCookieCtrl(id: string): FormControl {
    if (!this.cookieCtrls[id]) this.cookieCtrls[id] = new FormControl('');
    return this.cookieCtrls[id];
  }

  toggleCookies(id: string) {
    this.expandedId = this.expandedId === id ? '' : id;
  }

  load(showSpinner = false) {
    if (showSpinner) { this.loading = true; this.loadError = ''; }
    this.svc.getBotStatus().subscribe({
      next: (a) => { this.accounts = a; this.loading = false; },
      error: (e) => { this.loadError = e.error?.message || 'Failed to load. Check your connection.'; this.loading = false; },
    });
  }

  addAccount() {
    if (this.labelCtrl.invalid) return;
    this.adding = true; this.addError = '';
    this.svc.create(this.labelCtrl.value!).subscribe({
      next: () => { this.labelCtrl.reset(); this.adding = false; this.load(); this.snack.open('Account added', 'OK', { duration: 2500 }); },
      error: (e) => { this.addError = e.error?.message || 'Failed to add account'; this.adding = false; },
    });
  }

  saveCookies(account: FbAccount) {
    const raw = this.getCookieCtrl(account.id).value?.trim();
    if (!raw) return;
    try { JSON.parse(raw); } catch {
      this.cookieError[account.id] = 'Invalid JSON — paste the full array from the browser extension';
      return;
    }
    this.savingCookies[account.id] = true;
    this.cookieError[account.id] = '';
    this.svc.updateCookies(account.id, raw).subscribe({
      next: () => {
        this.savingCookies[account.id] = false;
        this.expandedId = '';
        this.getCookieCtrl(account.id).reset();
        this.load();
        this.snack.open('Cookies saved — bot is ready to start', 'OK', { duration: 3000 });
      },
      error: (e) => { this.savingCookies[account.id] = false; this.cookieError[account.id] = e.error?.message || 'Failed to save'; },
    });
  }

  startBot(account: FbAccount) {
    this.busy[account.id] = true;
    this.svc.startBot(account.id).subscribe({
      next: () => { this.load(); this.busy[account.id] = false; this.snack.open('Bot started', 'OK', { duration: 2500 }); },
      error: (e) => { this.busy[account.id] = false; this.snack.open(e.error?.message || 'Failed to start', 'OK', { duration: 3000 }); },
    });
  }

  stopBot(account: FbAccount) {
    this.busy[account.id] = true;
    this.svc.stopBot(account.id).subscribe({
      next: () => { this.load(); this.busy[account.id] = false; this.snack.open('Bot stopped', 'OK', { duration: 2500 }); },
      error: () => (this.busy[account.id] = false),
    });
  }

  remove(account: FbAccount) {
    if (!confirm(`Delete account "${account.label}"?`)) return;
    this.busy[account.id] = true;
    this.svc.remove(account.id).subscribe({
      next: () => { this.load(); this.snack.open('Account removed', 'OK', { duration: 2500 }); },
      error: () => (this.busy[account.id] = false),
    });
  }
}
