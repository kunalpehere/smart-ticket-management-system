import { Routes } from '@angular/router';
import { HomePage } from './features/home/home-page';
import { AppShell } from './layout/app-shell/app-shell';

export const routes: Routes = [
  {
    path: '',
    component: AppShell,
    children: [
      { path: '', component: HomePage },
      { path: '**', redirectTo: '' }
    ]
  }
];
