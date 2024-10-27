import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MunicipioAutocompleteComponent } from '../municipio-autocomplete/municipio-autocomplete.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TceQueriesService } from '../../services/tce-queries.service';
import { LiquidacoesQueryParams, Municipio } from '../../services/tce.types';
import { MatSelectModule } from '@angular/material/select';
import { UnidadesGestorasSelectComponent } from '../unidades-gestoras-select/unidades-gestoras-select.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { HeadsOrganizerComponent } from '../heads-organizer/heads-organizer.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LiquidacoesStore } from './liquidacoes.store';

const YEARS_SINCE_2003 = Array.from(
  { length: new Date().getFullYear() - 2003 + 1 },
  (_, i) => 2003 + i
);

@Component({
  selector: 'cmp-liquidacoes',
  standalone: true,
  templateUrl: './liquidacoes.component.html',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
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
  providers: [provideNgxMask(), LiquidacoesStore]
})
export class LiquidacoesComponent {
  store = inject(LiquidacoesStore);
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

  //#region Signals
  selectedMunicipio = signal<Municipio | undefined>(undefined);

  showHeadsOrganizer = signal<boolean>(false);

  loading = computed<boolean>(() => {
    return this.store.status() === 'loading';
  });

  resultsMsg = computed<string>(() => {
    if (this.store.status() === 'loaded') {
      return `${this.store.data().length} liquidações encontradas`;
    } else return '';
  });
  //#endregion

  constructor() {
    this.versaoExercicioOrcamento.disable();

    this.anoExercicioOrcamento.valueChanges.subscribe((value) => {
      this.codigoOrgao.disable();

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

    const params: LiquidacoesQueryParams = {
      codigo_municipio: selectedMunicipio.codigo_municipio,
      exercicio_orcamento,
      deslocamento: 0,
      quantidade: 100
    };

    if (this.codigoOrgao.value) params.codigo_orgao = this.codigoOrgao.value;

    this.store.fetchData(params);
  }
}
