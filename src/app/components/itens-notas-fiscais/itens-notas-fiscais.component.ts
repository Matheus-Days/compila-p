import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { WorkbooksStore } from '../../stores/workbooks.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { HeadsOrganizerComponent } from '../heads-organizer/heads-organizer.component';

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
    MatProgressSpinnerModule,
    MatSelectModule,
    NgxMaskDirective,
    ReactiveFormsModule,
    // Standalone
    HeadsOrganizerComponent
  ],
  providers: [provideNgxMask()]
})
export class ItensNotasFiscaisComponent {
  store = inject(WorkbooksStore);

  readonly years = YEARS_SINCE_2003;

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
    return this.store.itensNotasFiscais.progress() * 100;
  });

  constructor() {
    this.versaoExercicioOrcamento.disable();

    this.anoExercicioOrcamento.valueChanges.subscribe((value) => {
      if (value < 2007) this.versaoExercicioOrcamento.enable();
      else this.versaoExercicioOrcamento.disable();
    });
  }

  clear(): void {
    this.store.clearItensNotasFiscais();
    this.form.reset();
  }

  search(): void {
    const selectedMunicipio = this.store
      .municipios()
      .data.find((m) => m.nome_municipio === this.municipioControl.value);
    if (!selectedMunicipio) return;

    const exercicio_orcamento = `${this.anoExercicioOrcamento.value}${this.versaoExercicioOrcamento.value}`;

    this.store.fetchItensNotasFiscais({
      codigo_municipio: selectedMunicipio.codigo_municipio,
      exercicio_orcamento,
      codigo_orgao: this.codigoOrgao.value,
      deslocamento: 0,
      quantidade: 100
    });
  }
}
