import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { DateRange, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { toSignal } from '@angular/core/rxjs-interop';
import { HeadsOrganizerComponent } from '../heads-organizer/heads-organizer.component';
import { WorkbooksStore } from '../../stores/workbooks.store';

@Component({
  selector: 'cmp-table-contratos',
  standalone: true,
  templateUrl: './table-contratos.component.html',
  styleUrl: './table-contratos.component.scss',
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    // Standalone
    HeadsOrganizerComponent
  ],
  providers: [provideNativeDateAdapter(), DatePipe]
})
export class TableContratosComponent {
  store = inject(WorkbooksStore);

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

  canGenerateWorkbook = computed<boolean>(() => {
    return this.store.status() === 'LOADED_CONTRATOS_DETALHADOS';
  });

  loading = computed<boolean>(() => {
    const status = this.store.status();
    return status.startsWith('LOADING');
  });

  municipios = computed(() => {
    return this.store.municipios().list.filter((m) => {
      const value = (this.municipioValue() || '').toLowerCase();
      return m.nome_municipio.toLowerCase().includes(value);
    });
  });

  resultNumber = computed<number>(() => {
    return this.store.contratosDetalhados().list.length;
  });

  statusMessage = computed<string>(() => {
    console.log(this.store.statusMessage());
    return this.store.statusMessage();
  });

  constructor() {
    this.dateRangeGroup.valueChanges.subscribe((val) => {
      if (!val.start || !val.end) return;
      this.store.onDateRangeChange(new DateRange(val.start, val.end));
    });
  }

  clear(): void {
    this.store.clearContratosDetalhados();
    this.form.reset();
  }

  onMunicipioSelected(event: MatAutocompleteSelectedEvent) {
    const selectedMunicipio = this.municipios().find(
      (m) => m.nome_municipio === event.option.value
    );
    if (selectedMunicipio) this.store.onMunicipioSelected(selectedMunicipio);
  }

  async search(): Promise<void> {
    this.store.searchContratosDetalhadosData();
  }
}
