import { Routes } from '@angular/router';
import { WorkbooksStore } from './stores/workbooks.store';
import { DatePipe } from '@angular/common';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
    providers: [DatePipe, WorkbooksStore]
  }
];
