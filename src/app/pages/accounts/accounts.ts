import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { LoginSessionService } from '../../core/services/login-session.service';

const PUPPETEER_W = 1280;
const PUPPETEER_H = 900;

const KEY_MAP: Record<string, string> = {
  Enter: 'Enter', Backspace: 'Backspace', Tab: 'Tab', Escape: 'Escape',
  Delete: 'Delete', Home: 'Home', End: 'End',
  ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight',
  ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown',
};

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
                    <span class="warn-hint"><mat-icon class="warn-icon">warning</mat-icon> Not logged in</span>
                  }
                  @if (account.isRunning) {
                    <button mat-stroked-button color="warn" (click)="stopBot(account)" [disabled]="busy[account.id]">
                      <mat-icon>stop</mat-icon> Stop
                    </button>
                  } @else {
                    <button mat-flat-button color="primary" (click)="startBot(account)"
                      [disabled]="busy[account.id] || !account.hasCookies"
                      [matTooltip]="!account.hasCookies ? 'Log in to Facebook first' : ''">
                      <mat-icon>play_arrow</mat-icon> Start
                    </button>
                  }
                  <button mat-flat-button color="accent" (click)="openLogin(account)"
                    [disabled]="loginSessionId === account.id || sessionStarting">
                    <mat-icon>login</mat-icon>
                    {{ account.hasCookies ? 'Re-login' : 'Login with Facebook' }}
                  </button>
                  <button mat-icon-button color="warn" (click)="remove(account)" [disabled]="busy[account.id]">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>

              @if (loginSessionId === account.id) {
                <div class="session-section">
                  <div class="session-header">
                    <span class="session-title">
                      <mat-icon>open_in_browser</mat-icon>
                      Log in to Facebook — click the browser below, then type
                    </span>
                    <button mat-icon-button (click)="closeLogin(account.id)">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                  @if (sessionLoggedIn) {
                    <div class="session-success">
                      <mat-icon>check_circle</mat-icon> Logged in! Cookies saved. You can now start the bot.
                    </div>
                  } @else if (!sessionSrc) {
                    <div class="session-loading"><mat-spinner diameter="40" /><p>Loading browser...</p></div>
                  } @else {
                    <div class="session-browser" tabindex="0" #sessionEl
                         (keydown)="onKey($event, sessionEl)">
                      <img [src]="sessionSrc" class="session-img"
                           (click)="onImgClick($event, sessionEl)" />
                    </div>
                    <p class="session-hint">Click on the browser image to interact, then type normally</p>
                  }
                </div>
              }
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 900px; }
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

    /* Login session */
    .session-section { border-top: 1px solid #e0e0e0; background: #111; }
    .session-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: #1a1a2e; }
    .session-title { display: flex; align-items: center; gap: 8px; color: #90caf9; font-size: 13px; font-weight: 500; }
    .session-title mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .session-header button { color: #aaa; }
    .session-success { display: flex; align-items: center; gap: 8px; padding: 20px; color: #81c784; font-weight: 600; font-size: 15px; background: #1b2a1b; }
    .session-success mat-icon { color: #81c784; }
    .session-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px; color: #aaa; }
    .session-browser { outline: none; cursor: crosshair; display: block; line-height: 0; }
    .session-browser:focus { box-shadow: inset 0 0 0 2px #4f8ef7; }
    .session-img { width: 100%; display: block; }
    .session-hint { margin: 0; padding: 8px 16px; font-size: 12px; color: #888; background: #1a1a1a; text-align: center; }
  `]
})
export class Accounts implements OnInit, OnDestroy {
  accounts: FbAccount[] = [];
  loading = true;
  loadError = '';
  adding = false;
  addError = '';
  busy: Record<string, boolean> = {};
  labelCtrl = new FormControl('', Validators.required);

  // Login session state
  loginSessionId = '';
  sessionSrc = '';
  sessionLoggedIn = false;
  sessionStarting = false;
  private screenshotTimer: any;
  private statusTimer: any;

  constructor(
    private svc: AccountsService,
    private loginSvc: LoginSessionService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() { this.load(true); }

  ngOnDestroy() {
    this.clearTimers();
    if (this.loginSessionId) {
      this.loginSvc.close(this.loginSessionId).subscribe();
    }
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

  openLogin(account: FbAccount) {
    this.sessionStarting = true;
    this.loginSvc.start(account.id).subscribe({
      next: () => {
        this.loginSessionId = account.id;
        this.sessionSrc = '';
        this.sessionLoggedIn = false;
        this.sessionStarting = false;
        this.startPolling(account.id);
      },
      error: (e) => {
        this.sessionStarting = false;
        this.snack.open(e.error?.message || 'Failed to open browser', 'OK', { duration: 3000 });
      },
    });
  }

  closeLogin(accountId: string) {
    this.clearTimers();
    this.loginSvc.close(accountId).subscribe();
    this.loginSessionId = '';
    this.sessionSrc = '';
    this.load();
  }

  onImgClick(event: MouseEvent, el: HTMLElement) {
    const img = event.target as HTMLImageElement;
    const rect = img.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left) * (PUPPETEER_W / rect.width));
    const y = Math.round((event.clientY - rect.top) * (PUPPETEER_H / rect.height));
    this.loginSvc.click(this.loginSessionId, x, y).subscribe();
    el.focus();
  }

  onKey(event: KeyboardEvent, el: HTMLElement) {
    event.preventDefault();
    const mapped = KEY_MAP[event.key];
    if (mapped) {
      this.loginSvc.press(this.loginSessionId, mapped).subscribe();
    } else if (event.key.length === 1) {
      this.loginSvc.type(this.loginSessionId, event.key).subscribe();
    }
  }

  private startPolling(accountId: string) {
    this.screenshotTimer = setInterval(() => this.fetchScreenshot(accountId), 600);
    this.statusTimer = setInterval(() => this.checkStatus(accountId), 2000);
    this.fetchScreenshot(accountId);
  }

  private fetchScreenshot(accountId: string) {
    this.loginSvc.getScreenshot(accountId).subscribe({
      next: (src) => { this.sessionSrc = src; },
      error: () => {},
    });
  }

  private checkStatus(accountId: string) {
    this.loginSvc.getStatus(accountId).subscribe({
      next: (s) => {
        if (s.loggedIn) {
          this.sessionLoggedIn = true;
          this.clearTimers();
          setTimeout(() => {
            this.loginSessionId = '';
            this.sessionSrc = '';
            this.load();
            this.snack.open('Facebook login saved — you can now start the bot', 'OK', { duration: 4000 });
          }, 2500);
        }
      },
      error: () => {},
    });
  }

  private clearTimers() {
    clearInterval(this.screenshotTimer);
    clearInterval(this.statusTimer);
  }
}
