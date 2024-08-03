import { Component, computed, inject, signal } from '@angular/core';
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
  selector: 'cmp-table-itens-nf',
  standalone: true,
  templateUrl: './table-itens-nf.component.html',
  styleUrl: './table-itens-nf.component.scss',
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
export class TableItensNfComponent {
  store = inject(WorkbooksStore);

  readonly years = YEARS_SINCE_2003;

  anoExercicioOrcamento = new FormControl(new Date().getFullYear(), {
    validators: Validators.required,
    nonNullable: true
  });
  municipioControl = new FormControl('', Validators.required);
  versaoExercicioOrcamento = new FormControl('00', {
    validators: Validators.required,
    nonNullable: true
  });

  form = new FormGroup({
    municipioControl: this.municipioControl,
    anoExercicioOrcamento: this.anoExercicioOrcamento,
    versaoExercicioOrcamento: this.versaoExercicioOrcamento
  });

  private municipioValue = toSignal(this.municipioControl.valueChanges);
  showHeadsOrganizer = signal<boolean>(false);

  canGenerateWorkbook = computed<boolean>(() => {
    return this.store.status() === 'LOADED_ITENS_NOTAS_FISCAIS';
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

  constructor() {
    this.versaoExercicioOrcamento.disable();
    this.onExercicioOrcamentoChange();

    this.versaoExercicioOrcamento.valueChanges.subscribe(() => {
      this.onExercicioOrcamentoChange();
    })

    this.anoExercicioOrcamento.valueChanges.subscribe((value) => {
      if (value < 2007) this.versaoExercicioOrcamento.enable();
      else this.versaoExercicioOrcamento.disable();

      this.onExercicioOrcamentoChange();
    });
  }

  clear(): void {
    this.store.clearItensNotasFiscais();
    this.form.reset();
  }

  onMunicipioSelected(event: MatAutocompleteSelectedEvent) {
    const selectedMunicipio = this.municipios().find(
      (m) => m.nome_municipio === event.option.value
    );
    if (selectedMunicipio) this.store.onMunicipioSelected(selectedMunicipio);
  }

  onExercicioOrcamentoChange() {
    const year = this.anoExercicioOrcamento.value;
    const version = year < 2007 ? this.versaoExercicioOrcamento.value : '00';
    this.store.onExercicioOrcamentoChange(`${year}${version}`);
  }
}
