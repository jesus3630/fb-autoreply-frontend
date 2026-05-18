import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthService } from './core/services/auth.service';

const guestGuard = () => {
  if (inject(AuthService).isLoggedIn()) {
    inject(Router).navigate(['/dashboard']);
    return false;
  }
  return true;
};

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./pages/register/register').then((m) => m.Register) },
  {
    path: '',
    loadComponent: () => import('./shared/components/shell/shell').then((m) => m.Shell),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'accounts', loadComponent: () => import('./pages/accounts/accounts').then((m) => m.Accounts) },
      { path: 'templates', loadComponent: () => import('./pages/templates/templates').then((m) => m.Templates) },
      { path: 'analytics', loadComponent: () => import('./pages/analytics/analytics').then((m) => m.Analytics) },
      { path: 'pricing', loadComponent: () => import('./pages/pricing/pricing').then((m) => m.Pricing) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
