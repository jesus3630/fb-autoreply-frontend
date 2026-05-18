import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="auth-wrap">
      <mat-card class="auth-card">
        <div class="auth-brand">
          <mat-icon>reply</mat-icon>
          <span>AutoReply</span>
        </div>
        <h2>Create your account</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" autocomplete="name" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" autocomplete="email" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" [type]="hide ? 'password' : 'text'" autocomplete="new-password" />
            <button mat-icon-button matSuffix type="button" (click)="hide = !hide">
              <mat-icon>{{ hide ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>
          @if (error) { <p class="error">{{ error }}</p> }
          <button mat-flat-button color="primary" type="submit" [disabled]="loading">
            {{ loading ? 'Creating account...' : 'Get started free' }}
          </button>
        </form>
        <p class="switch">Already have an account? <a routerLink="/login">Sign in</a></p>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f6fa; }
    .auth-card { width: 100%; max-width: 400px; padding: 32px; }
    .auth-brand { display: flex; align-items: center; gap: 8px; font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px; }
    .auth-brand mat-icon { color: #4f8ef7; font-size: 28px; }
    h2 { margin: 0 0 24px; font-size: 18px; color: #555; font-weight: 400; }
    form { display: flex; flex-direction: column; gap: 4px; }
    mat-form-field { width: 100%; }
    button[type=submit] { margin-top: 8px; height: 44px; font-size: 15px; }
    .error { color: #e53935; font-size: 13px; margin: 0; }
    .switch { text-align: center; font-size: 13px; color: #777; margin-top: 16px; }
    .switch a { color: #4f8ef7; text-decoration: none; font-weight: 500; }
  `]
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  hide = true; loading = false; error = '';
  form = this.fb.group({ name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(8)]] });

  submit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    const { email, password, name } = this.form.value;
    this.auth.register(email!, password!, name!).subscribe({ error: (e) => { this.error = e.error?.message || 'Registration failed'; this.loading = false; } });
  }
}
