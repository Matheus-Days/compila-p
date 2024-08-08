import {
  Component,
  inject,
  signal,
} from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ContratosDetalhadosComponent } from '../contratos-detalhados/contratos-detalhados.component';
import { ItensNotasFiscaisComponent } from '../itens-notas-fiscais/itens-notas-fiscais.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  openedAnimation,
  slideLeftAnimation,
  slideRightAnimation
} from './home.animation';
import { ActivatedRoute } from '@angular/router';
import {
  WorksheetOptsComponent
} from '../worksheet-opts/worksheet-opts.component';
import { WorksheetResultsComponent } from '../worksheet-results/worksheet-results.component';
import { WorksheetOption } from '../../stores/workbooks.utils';
import { NotasEmpenhosComponent } from "../notas-empenhos/notas-empenhos.component";
import { WorkbooksStore } from '../../stores/workbooks.store';

@Component({
  selector: 'cmp-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [openedAnimation, slideLeftAnimation, slideRightAnimation],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    // Standalone
    ContratosDetalhadosComponent,
    ItensNotasFiscaisComponent,
    WorksheetOptsComponent,
    WorksheetResultsComponent,
    NotasEmpenhosComponent
]
})
export class HomeComponent {
  private activatedRoute = inject(ActivatedRoute);
  store = inject(WorkbooksStore);

  worksheetOptsOpened = signal(true);
  worksheetOptions = signal<WorksheetOption[]>([]);
  worksheetResultsOpened = signal(true);

  constructor() {
    this.activatedRoute.queryParams.subscribe((params) => {
      const selectedWorksheets = (
        params['worksheets'] ? decodeURI(params['worksheets']).split(',') : []
      ) as WorksheetOption[];
      this.worksheetOptions.set(selectedWorksheets);
    });
  }

  toggleWorksheetOpts(): void {
    this.worksheetOptsOpened.set(!this.worksheetOptsOpened());
  }

  toggleWorksheetResults(): void {
    this.worksheetResultsOpened.set(!this.worksheetResultsOpened());
  }
}
