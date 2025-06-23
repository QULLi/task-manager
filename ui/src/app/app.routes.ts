import { Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'signIn', pathMatch: 'full' },

  {
    path: 'signIn',
    loadComponent: () =>
      import('./sign-in/sign-in-options.component').then(m => m.SignInOptionsComponent)
  },

  {
    path: 'signIn-password',
    loadComponent: () =>
      import('./sign-in/sign-in-password.component').then(m => m.SignInPasswordComponent)
  },

  {
    path: 'signIn-otp',
    loadComponent: () =>
      import('./sign-in/sign-in.component').then(m => m.SignInComponent)
  },

  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },

  { path: '**', redirectTo: 'signIn' }
];
