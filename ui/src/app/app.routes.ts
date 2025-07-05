import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'signIn', pathMatch: 'full' },
  {
    path: 'signIn',
    loadComponent: () =>
      import('./sign-in/sign-in-options.component').then(m => m.SignInOptionsComponent)
  },
  {
    path: 'signIn-otp',
    loadComponent: () =>
      import('./sign-in/sign-in.component').then(m => m.SignInComponent)
  },
  {
    path: 'signIn-password',
    loadComponent: () =>
      import('./sign-in/sign-in-password.component').then(m => m.SignInPasswordComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./profile/task-page/task-page.component').then(m => m.TaskPageComponent)
  },
  { path: '**', redirectTo: 'signIn' }
];
