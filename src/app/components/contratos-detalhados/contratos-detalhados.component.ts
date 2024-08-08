import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { DateRange, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { toSignal } from '@angular/core/rxjs-interop';
import { HeadsOrganizerComponent } from '../heads-organizer/heads-organizer.component';
import { WorkbooksStore } from '../../stores/workbooks.store';
import { formatRange } from '../../stores/contratos-detalhados.feature';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
  selector: 'cmp-contratos-detalhados',
  standalone: true,
  templateUrl: './contratos-detalhados.component.html',
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    // Standalone
    HeadsOrganizerComponent,
    ProgressBarComponent
  ],
  providers: [provideNativeDateAdapter(), DatePipe]
})
export class ContratosDetalhadosComponent {
  store = inject(WorkbooksStore);
  datePipe = inject(DatePipe);

  municipioControl = new FormControl('', Validators.required);

  dateRangeGroup = new FormGroup({
    start: new FormControl<Date | null>(null, Validators.required),
    end: new FormControl<Date | null>(null, Validators.required)
  });

  form = new FormGroup({
    municipioControl: this.municipioControl,
    dateRangeGroup: this.dateRangeGroup
  });

  private municipioValue = toSignal(this.municipioControl.valueChanges);
  
  showHeadsOrganizer = signal<boolean>(false);

  loading = computed<boolean>(() => {
    return this.store.contratosDetalhados().status === 'loading';
  });

  message = computed<string>(() => {
    return this.store.contratosDetalhados.message();
  });

  municipios = computed(() => {
    return this.store.municipios().data.filter((m) => {
      const value = (this.municipioValue() || '').toLowerCase();
      return m.nome_municipio.toLowerCase().includes(value);
    });
  });

  progress = computed<number>(() => {
    // TODO: Get progress from store
    if (this.loading()) return -1;
    else return 0;
  });

  resultNumber = computed<string>(() => {
    const count = this.store.contratosDetalhados().data.length;
    if (this.store.contratosDetalhados().status === 'loaded')
      return `${count} resultado(s) encontrado(s)`;
    else return '';
  });

  clear(): void {
    this.store.clearContratosDetalhados();
    this.form.reset();
  }

  async search(): Promise<void> {
    if (!this.dateRangeGroup.value.start) return;
    if (!this.dateRangeGroup.value.end) return;

    const selectedMunicipio = this.store.municipios().data.find(
      (m) => m.nome_municipio === this.municipioControl.value
    );
    if (!selectedMunicipio) return;

    const range = new DateRange<Date>(
      this.dateRangeGroup.value.start,
      this.dateRangeGroup.value.end
    );

    const data_contrato = formatRange(range, this.datePipe);

    this.store.fetchContratosDetalhados({
      codigo_municipio: selectedMunicipio.codigo_municipio,
      data_contrato,
      quantidade: 100,
      deslocamento: 0
    });
  }
}
