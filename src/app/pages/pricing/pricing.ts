import { Component } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { BillingService } from '../../core/services/billing.service';

const PLANS = [
  { name: 'Starter', price: '$19', period: '/mo', priceId: 'price_starter_monthly', accounts: 1, replies: '200/mo', features: ['1 FB account', '200 replies/month', 'Template rotation', 'Basic analytics'], color: '#4f8ef7' },
  { name: 'Pro', price: '$49', period: '/mo', priceId: 'price_pro_monthly', accounts: 5, replies: 'Unlimited', features: ['5 FB accounts', 'Unlimited replies', 'AI-powered replies', 'Full analytics', 'Priority support'], color: '#2e7d32', popular: true },
  { name: 'Business', price: '$129', period: '/mo', priceId: 'price_business_monthly', accounts: 20, replies: 'Unlimited', features: ['20 FB accounts', 'Unlimited replies', 'AI replies', 'Multi-user seats', 'CRM export'], color: '#e65100' },
  { name: 'Agency', price: '$299', period: '/mo', priceId: 'price_agency_monthly', accounts: -1, replies: 'Unlimited', features: ['Unlimited accounts', 'Unlimited replies', 'White-label', 'API access', 'Dedicated support'], color: '#6a1b9a' },
];

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [UpperCasePipe, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Upgrade Your Plan</h1>
        <p>You're currently on the <strong>{{ auth.user()?.tier | uppercase }}</strong> plan.</p>
      </div>

      <div class="plans-grid">
        @for (plan of plans; track plan.name) {
          <mat-card class="plan-card" [class.popular]="plan.popular" [class.current]="auth.user()?.tier === plan.name.toLowerCase()">
            @if (plan.popular) { <div class="popular-badge">Most Popular</div> }
            @if (auth.user()?.tier === plan.name.toLowerCase()) { <div class="current-badge">Current Plan</div> }
            <div class="plan-name" [style.color]="plan.color">{{ plan.name }}</div>
            <div class="plan-price">{{ plan.price }}<span class="period">{{ plan.period }}</span></div>
            <ul class="features">
              @for (f of plan.features; track f) {
                <li><mat-icon class="check" [style.color]="plan.color">check_circle</mat-icon> {{ f }}</li>
              }
            </ul>
            <button mat-flat-button [style.background]="plan.color" style="color:#fff"
              (click)="upgrade(plan.priceId)"
              [disabled]="auth.user()?.tier === plan.name.toLowerCase() || loading === plan.priceId">
              {{ auth.user()?.tier === plan.name.toLowerCase() ? 'Current Plan' : 'Upgrade' }}
            </button>
          </mat-card>
        }
      </div>

      <div class="portal-row">
        <p>Already subscribed? <button mat-button color="primary" (click)="openPortal()">Manage billing</button></p>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; }
    .page-header { margin-bottom: 32px; text-align: center; }
    h1 { font-size: 28px; margin: 0 0 8px; }
    p { color: #666; margin: 0; }
    .plans-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; max-width: 1100px; margin: 0 auto; }
    .plan-card { padding: 28px 20px; position: relative; display: flex; flex-direction: column; gap: 12px; }
    .plan-card.popular { border: 2px solid #2e7d32; }
    .plan-card.current { opacity: 0.7; }
    .popular-badge, .current-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); padding: 2px 14px; border-radius: 12px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .popular-badge { background: #2e7d32; color: #fff; }
    .current-badge { background: #4f8ef7; color: #fff; }
    .plan-name { font-size: 18px; font-weight: 700; }
    .plan-price { font-size: 36px; font-weight: 800; }
    .period { font-size: 16px; font-weight: 400; color: #888; }
    ul.features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; flex: 1; }
    ul.features li { display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .check { font-size: 18px; width: 18px; height: 18px; }
    button[mat-flat-button] { height: 44px; font-size: 14px; font-weight: 600; margin-top: auto; }
    .portal-row { text-align: center; margin-top: 24px; }
  `]
})
export class Pricing {
  plans = PLANS;
  loading: string | null = null;

  constructor(public auth: AuthService, private billing: BillingService, private snack: MatSnackBar) {}

  upgrade(priceId: string) {
    this.loading = priceId;
    this.billing.checkout(priceId).subscribe({
      next: (res) => { window.location.href = res.url; },
      error: () => { this.snack.open('Billing unavailable — Stripe keys not configured yet.', 'OK', { duration: 4000 }); this.loading = null; }
    });
  }

  openPortal() {
    this.billing.portal().subscribe({
      next: (res) => { window.location.href = res.url; },
      error: () => this.snack.open('No billing account found.', 'OK', { duration: 3000 })
    });
  }
}
