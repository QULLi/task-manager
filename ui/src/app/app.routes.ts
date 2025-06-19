import { Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'signIn', pathMatch: 'full' },
  { path: 'signIn', component: SignInComponent },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'signIn' },
  { path: 'profile',
  loadComponent: () => import('../app/profile/profile.component').then(m => m.ProfileComponent),
  canActivate: [AuthGuard]
}

];
