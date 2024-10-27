import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { DateRange, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { HeadsOrganizerComponent } from '../heads-organizer/heads-organizer.component';
import {
  ContratosDetalhadosStore,
  formatRange
} from './contratos-detalhados.store';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { MunicipioAutocompleteComponent } from '../municipio-autocomplete/municipio-autocomplete.component';
import { Municipio } from '../../services/tce.types';

@Component({
  selector: 'cmp-contratos-detalhados',
  standalone: true,
  templateUrl: './contratos-detalhados.component.html',
  imports: [
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
    MunicipioAutocompleteComponent,
    ProgressBarComponent
  ],
  providers: [provideNativeDateAdapter(), DatePipe, ContratosDetalhadosStore]
})
export class ContratosDetalhadosComponent {
  store = inject(ContratosDetalhadosStore);
  datePipe = inject(DatePipe);

  municipioControl = new FormControl('', {
    validators: Validators.required,
    nonNullable: true
  });

  dateRangeGroup = new FormGroup({
    start: new FormControl<Date | null>(null, Validators.required),
    end: new FormControl<Date | null>(null, Validators.required)
  });

  form = new FormGroup({
    municipioControl: this.municipioControl,
    dateRangeGroup: this.dateRangeGroup
  });

  selectedMunicipio = signal<Municipio | undefined>(undefined);

  showHeadsOrganizer = signal<boolean>(false);

  loading = computed<boolean>(() => {
    return this.store.status() === 'loading';
  });

  progress = computed<number>(() => {
    // TODO: Get progress from store
    if (this.loading()) return -1;
    else return 0;
  });

  resultsMsg = computed<string>(() => {
    const count = this.store.data().length;
    if (this.store.status() === 'loaded')
      return `${count} resultado(s) encontrado(s)`;
    else return '';
  });

  clear(): void {
    this.selectedMunicipio.set(undefined);
    this.store.clear();
    this.form.reset();
  }

  async search(): Promise<void> {
    const selectedMunicipio = this.selectedMunicipio();
    if (!selectedMunicipio) return;
    if (!this.dateRangeGroup.value.start) return;
    if (!this.dateRangeGroup.value.end) return;

    const range = new DateRange<Date>(
      this.dateRangeGroup.value.start,
      this.dateRangeGroup.value.end
    );

    const data_contrato = formatRange(range, this.datePipe);

    this.store.fetchData({
      codigo_municipio: selectedMunicipio.codigo_municipio,
      data_contrato,
      quantidade: 100,
      deslocamento: 0
    });
  }
}
