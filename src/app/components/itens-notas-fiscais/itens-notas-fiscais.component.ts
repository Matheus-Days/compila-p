import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { WorkbooksStore } from '../../stores/workbooks.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { HeadsOrganizerComponent } from '../heads-organizer/heads-organizer.component';
import { TceQueriesService } from '../../services/tce-queries.service';
import { ItensNotasFiscaisQueryParams, Municipio, UnidadeGestora } from '../../services/tce.types';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

const YEARS_SINCE_2003 = Array.from(
  { length: new Date().getFullYear() - 2003 + 1 },
  (_, i) => 2003 + i
);

@Component({
  selector: 'cmp-itens-notas-fiscais',
  standalone: true,
  templateUrl: './itens-notas-fiscais.component.html',
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
    NgxMaskDirective,
    ReactiveFormsModule,
    // Standalone
    HeadsOrganizerComponent,
    ProgressBarComponent
  ],
  providers: [provideNgxMask()]
})
export class ItensNotasFiscaisComponent {
  store = inject(WorkbooksStore);
  tceQueries = inject(TceQueriesService);

  readonly years = YEARS_SINCE_2003;

  private selectedMunicipio?: Municipio;

  anoExercicioOrcamento = new FormControl(new Date().getFullYear(), {
    validators: Validators.required,
    nonNullable: true
  });
  codigoOrgao = new FormControl('', { nonNullable: true });
  municipioControl = new FormControl('', Validators.required);
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

  unidadesGestoras = signal<UnidadeGestora[]>([]);

  private municipioValue = toSignal(this.municipioControl.valueChanges);
  
  showHeadsOrganizer = signal<boolean>(false);

  loading = computed<boolean>(() => {
    return this.store.itensNotasFiscais.status() === 'loading';
  });

  message = computed<string>(() => {
    return this.store.itensNotasFiscais.message();
  });

  municipios = computed(() => {
    return this.store.municipios().data.filter((m) => {
      const value = (this.municipioValue() || '').toLowerCase();
      return m.nome_municipio.toLowerCase().includes(value);
    });
  });

  progress = computed<number>(() => {
    return this.store.itensNotasFiscais.progress();
  });

  results = computed<string>(() => {
    if (this.store.itensNotasFiscais().status === 'loaded')
      return `${this.store.itensNotasFiscais().data.length} itens encontrados.`;
    else return '';
  });

  constructor() {
    this.versaoExercicioOrcamento.disable();

    this.anoExercicioOrcamento.valueChanges.subscribe((value) => {
      if (value >= 2008) 
        this.updateUnidadesGestoras();
      else this.codigoOrgao.disable();

      if (value < 2007) this.versaoExercicioOrcamento.enable();
      else this.versaoExercicioOrcamento.disable();
    });

    this.versaoExercicioOrcamento.valueChanges.subscribe(() => {
      this.updateUnidadesGestoras();
    });
  }

  private async updateUnidadesGestoras(): Promise<void> {
    if (!this.selectedMunicipio) return;
    if (!this.anoExercicioOrcamento.value) return;

    const codigo_municipio = this.selectedMunicipio.codigo_municipio;
    const unidadesGestoras = await this.tceQueries.fetchUnidadesGestoras({
      codigo_municipio,
      exercicio_orcamento: `${this.anoExercicioOrcamento.value}${this.versaoExercicioOrcamento.value}`
    });
    this.unidadesGestoras.set(unidadesGestoras);
  }

  clear(): void {
    this.store.clearItensNotasFiscais();
    this.form.reset();
  }

  onMunicipioSelected(event: MatAutocompleteSelectedEvent): void {
    const nome_municipio = event.option.value;
    this.selectedMunicipio = this.store
      .municipios()
      .data.find((m) => m.nome_municipio === nome_municipio);
    this.updateUnidadesGestoras();
  }

  search(): void {
    if (!this.selectedMunicipio) return;

    const exercicio_orcamento = `${this.anoExercicioOrcamento.value}${this.versaoExercicioOrcamento.value}`;

    const params: ItensNotasFiscaisQueryParams = {
      codigo_municipio: this.selectedMunicipio.codigo_municipio,
      exercicio_orcamento,
      deslocamento: 0,
      quantidade: 100
    }

    if (this.codigoOrgao.value) params.codigo_orgao = this.codigoOrgao.value;

    this.store.fetchItensNotasFiscais(params);
  }
}
