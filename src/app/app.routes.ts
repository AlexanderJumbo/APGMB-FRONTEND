import { Routes } from '@angular/router';
import { authGuard } from './authentication/auth.guard';

import MainLayoutComponent from './layouts/MainLayout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.default),
  },

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // {
      //   path: 'user/home',
      //   loadComponent: () =>
      //     import('./pages/user-home-page/user-home.component').then(
      //       (m) => m.default
      //     ),
      //   //canActivate: [authGuard], // si quieres protegerla
      // },
      {
        path: 'gestionar-usuario',
        loadComponent: () =>
          import('./pages/manager-user/manage-user.component').then(
            (m) => m.default
          ),
      },
      {
        path: 'gestionar-clientes',
        loadComponent: () =>
          import('./pages/manager-client/manage-client.component').then(
            (m) => m.default
          ),
      },
      {
        path: 'reporte-lectura',
        loadComponent: () =>
          import('./pages/reading-report/reading-report.component').then(
            (m) => m.default
          ),
      },
      {
        path: 'gestionar-medidor',
        loadComponent: () =>
          import(
            './pages/manager-water-meter/manage-water-meter.component'
          ).then((m) => m.default),
      },
      {
        path: 'gestionar-cuentas',
        loadComponent: () =>
          import('./pages/manager-account/manage-account.component').then(
            (m) => m.default
          ),
      },
      {
        path: 'historico',
        loadComponent: () =>
          import('./pages/historical/historical.component').then(
            (m) => m.default
          ),
      },


    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
