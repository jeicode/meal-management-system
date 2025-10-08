import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },

  {
    path: 'historial-pedidos',
    loadComponent: () =>
      import('./pages/order-history/order-history.component').then((m) => m.OrderHistoryComponent),
  },

  {
    path: 'historial-compras',
    loadComponent: () =>
      import('./pages/purchase-history/purchase-history.component').then(
        (m) => m.PurchaseHistoryComponent,
      ),
  },

  {
    path: 'configuracion',
    loadComponent: () =>
      import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
