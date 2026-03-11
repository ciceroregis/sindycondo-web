import { Routes } from '@angular/router';
import { authGuard, guestGuard, notMoradorGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [notMoradorGuard],
        loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'moradores',
        canActivate: [notMoradorGuard],
        loadComponent: () => import('./moradores/moradores').then(m => m.MoradoresComponent)
      },
      {
        path: 'visitantes',
        loadComponent: () => import('./visitantes/visitantes').then(m => m.VisitantesComponent)
      },
      {
        path: 'acessos',
        loadComponent: () => import('./acessos/acessos').then(m => m.AcessosComponent)
      },
      {
        path: 'garagens',
        canActivate: [notMoradorGuard],
        loadComponent: () => import('./garagens/garagens').then(m => m.GaragensComponent)
      },
      {
        path: 'configuracoes',
        loadComponent: () => import('./configuracoes/configuracoes').then(m => m.ConfiguracoesComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./perfil/perfil').then(m => m.PerfilComponent)
      },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
