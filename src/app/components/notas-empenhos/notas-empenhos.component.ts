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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { HeadsOrganizerComponent } from '../heads-organizer/heads-organizer.component';
import { WorkbooksStore } from '../../stores/workbooks.store';
import { TceQueriesService } from '../../services/tce-queries.service';
import { Municipio } from '../../services/tce.types';
import {
  MonthsSelectComponent,
  MonthValue
} from '../months-select/months-select.component';
import { UnidadesGestorasSelectComponent } from '../unidades-gestoras-select/unidades-gestoras-select.component';
import { MunicipioAutocompleteComponent } from '../municipio-autocomplete/municipio-autocomplete.component';

const YEARS_SINCE_2003 = Array.from(
  { length: new Date().getFullYear() - 2003 + 1 },
  (_, i) => 2003 + i
);

@Component({
  selector: 'cmp-notas-empenhos',
  standalone: true,
  templateUrl: './notas-empenhos.component.html',
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ReactiveFormsModule,
    // Standalone
    HeadsOrganizerComponent,
    MonthsSelectComponent,
    MunicipioAutocompleteComponent,
    UnidadesGestorasSelectComponent
  ]
})
export class NotasEmpenhosComponent {
  store = inject(WorkbooksStore);
  tceQueries = inject(TceQueriesService);

  readonly years = YEARS_SINCE_2003;

  //#region Form Controls
  anoExercicioOrcamento = new FormControl(new Date().getFullYear(), {
    validators: Validators.required,
    nonNullable: true
  });

  codigosOrgaos = new FormControl<number[]>([], { nonNullable: true });

  mesesExercicioOrcamento = new FormControl<MonthValue[]>([], {
    nonNullable: true
  });

  municipioControl = new FormControl('', {
    validators: Validators.required,
    nonNullable: true
  });

  form = new FormGroup({
    anoExercicioOrcamento: this.anoExercicioOrcamento,
    codigosOrgaos: this.codigosOrgaos,
    mesesExercicioOrcamento: this.mesesExercicioOrcamento,
    municipioControl: this.municipioControl
  });
  //#endregion

  //#region Signals and computed signals
  selectedMunicipio = signal<Municipio | undefined>(undefined);

  showHeadsOrganizer = signal<boolean>(false);

  loading = computed<boolean>(() => {
    return this.store.notasEmpenhos().status === 'loading';
  });

  message = computed<string>(() => {
    return this.store.notasEmpenhos().message;
  });

  progress = computed<number>(() => {
    return this.store.notasEmpenhos().progress * 100;
  });

  results = computed<string>(() => {
    if (this.store.notasEmpenhos().status === 'loaded')
      return `${this.store.notasEmpenhos().data.length} itens encontrados.`;
    else return '';
  });
  //#endregion

  clear(): void {
    this.store.clearNotasEmpenhos();
    this.form.reset();
  }

  search(): void {
    const selectedMunicipio = this.selectedMunicipio();
    if (!selectedMunicipio) return;

    this.store.fetchNotasEmpenhos({
      codigo_municipio: selectedMunicipio.codigo_municipio,
      dre: {
        ano: this.anoExercicioOrcamento.value,
        meses: this.mesesExercicioOrcamento.value
      },
      codigosOrgaos: this.codigosOrgaos.value
    });
  }
}
