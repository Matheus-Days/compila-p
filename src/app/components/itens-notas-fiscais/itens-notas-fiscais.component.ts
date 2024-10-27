import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { HeadsOrganizerComponent } from '../heads-organizer/heads-organizer.component';
import { TceQueriesService } from '../../services/tce-queries.service';
import {
  ItensNotasFiscaisQueryParams,
  Municipio,
  UnidadeGestora
} from '../../services/tce.types';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { ItensNotasFicaisStore } from './itens-notas-fiscais.store';
import { MunicipioAutocompleteComponent } from '../municipio-autocomplete/municipio-autocomplete.component';
import { UnidadesGestorasSelectComponent } from '../unidades-gestoras-select/unidades-gestoras-select.component';

const YEARS_SINCE_2003 = Array.from(
  { length: new Date().getFullYear() - 2003 + 1 },
  (_, i) => 2003 + i
);

@Component({
  selector: 'cmp-itens-notas-fiscais',
  standalone: true,
  templateUrl: './itens-notas-fiscais.component.html',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    NgxMaskDirective,
    ReactiveFormsModule,
    // Standalone
    HeadsOrganizerComponent,
    MunicipioAutocompleteComponent,
    ProgressBarComponent,
    UnidadesGestorasSelectComponent
  ],
  providers: [provideNgxMask(), ItensNotasFicaisStore]
})
export class ItensNotasFiscaisComponent {
  store = inject(ItensNotasFicaisStore);
  tceQueries = inject(TceQueriesService);

  readonly years = YEARS_SINCE_2003;

  //#region Form Controls
  anoExercicioOrcamento = new FormControl(new Date().getFullYear(), {
    validators: Validators.required,
    nonNullable: true
  });
  
  codigoOrgao = new FormControl('', { nonNullable: true });
  
  municipioControl = new FormControl('', {
    validators: Validators.required,
    nonNullable: true
  });
  
  versaoExercicioOrcamento = new FormControl('00', {
    validators: Validators.required,
    nonNullable: true
  });

  form = new FormGroup({
    anoExercicioOrcamento: this.anoExercicioOrcamento,
    codigoOrgao: this.codigoOrgao,
    municipioControl: this.municipioControl,
    versaoExercicioOrcamento: this.versaoExercicioOrcamento
  });
  //#endregion

  selectedMunicipio = signal<Municipio | undefined>(undefined);

  showHeadsOrganizer = signal<boolean>(false);

  unidadesGestoras = signal<UnidadeGestora[]>([]);

  loading = computed<boolean>(() => {
    return this.store.status() === 'loading';
  });

  results = computed<string>(() => {
    if (this.store.status() === 'loaded')
      return `${this.store.data().length} itens encontrados.`;
    else return '';
  });

  constructor() {
    this.versaoExercicioOrcamento.disable();

    this.anoExercicioOrcamento.valueChanges.subscribe((value) => {
      if (value < 2007) this.versaoExercicioOrcamento.enable();
      else this.versaoExercicioOrcamento.disable();
    });
  }

  clear(): void {
    this.selectedMunicipio.set(undefined);
    this.store.clear();
    this.form.reset();
  }

  search(): void {
    const selectedMunicipio = this.selectedMunicipio();
    if (!selectedMunicipio) return;

    const exercicio_orcamento = `${this.anoExercicioOrcamento.value}${this.versaoExercicioOrcamento.value}`;

    const params: ItensNotasFiscaisQueryParams = {
      codigo_municipio: selectedMunicipio.codigo_municipio,
      exercicio_orcamento,
      deslocamento: 0,
      quantidade: 100
    };

    if (this.codigoOrgao.value) params.codigo_orgao = this.codigoOrgao.value;

    this.store.fetchData(params);
  }
}
