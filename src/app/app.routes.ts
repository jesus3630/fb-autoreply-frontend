import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then((m) => m.Register) },
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
