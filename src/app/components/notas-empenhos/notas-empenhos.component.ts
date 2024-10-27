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
import { MatSelectModule } from '@angular/material/select';
import { HeadsOrganizerComponent } from '../heads-organizer/heads-organizer.component';
import { TceQueriesService } from '../../services/tce-queries.service';
import { Municipio } from '../../services/tce.types';
import {
  MonthsSelectComponent,
  MonthValue
} from '../months-select/months-select.component';
import { UnidadesGestorasSelectComponent } from '../unidades-gestoras-select/unidades-gestoras-select.component';
import { MunicipioAutocompleteComponent } from '../municipio-autocomplete/municipio-autocomplete.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { NotasEmpenhosStore } from './notas-empenhos.store';

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
    MatSelectModule,
    ReactiveFormsModule,
    // Standalone
    HeadsOrganizerComponent,
    MonthsSelectComponent,
    MunicipioAutocompleteComponent,
    UnidadesGestorasSelectComponent,
    ProgressBarComponent
  ],
  providers: [NotasEmpenhosStore]
})
export class NotasEmpenhosComponent {
  store = inject(NotasEmpenhosStore);
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
    return this.store.status() === 'loading';
  });

  resultsMsg = computed<string>(() => {
    if (this.store.status() === 'loaded')
      return `${this.store.data().length} itens encontrados.`;
    else return '';
  });
  //#endregion

  clear(): void {
    this.selectedMunicipio.set(undefined);
    this.store.clear();
    this.form.reset();
  }

  search(): void {
    const selectedMunicipio = this.selectedMunicipio();
    if (!selectedMunicipio) return;

    this.store.fetchData({
      codigo_municipio: selectedMunicipio.codigo_municipio,
      dre: {
        ano: this.anoExercicioOrcamento.value,
        meses: this.mesesExercicioOrcamento.value
      },
      codigosOrgaos: this.codigosOrgaos.value
    });
  }
}
