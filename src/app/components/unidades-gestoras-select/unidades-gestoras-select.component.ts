import { Component, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { map } from 'rxjs';
import { UnidadeGestora } from '../../services/tce.types';
import { TceQueriesService } from '../../services/tce-queries.service';

@Component({
  selector: 'cmp-unidade-gestora-select',
  standalone: true,
  imports: [
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './unidades-gestoras-select.component.html',
  styleUrl: './unidades-gestoras-select.component.scss'
})
export class UnidadesGestorasSelectComponent {
  tceQueries = inject(TceQueriesService);

  label = input('Unidade Gestora');
  multiple = input(false);
  disableSelectAll = input(false);
  control = input<FormControl>(new FormControl(this.multiple() ? [] : '00'));
  codigoMunicipio = input('', { transform: (val) => String(val) });
  anoExercicioOrcamento = input('', { transform: (val) => String(val) + '00' });

  isAllSelected = toSignal(
    this.control().valueChanges.pipe(
      map((val) => val.length === this.unidadesGestoras.length)
    )
  );

  unidadesGestoras = signal<UnidadeGestora[]>([]);

  constructor() {
    effect(async () => {
      const codigo_municipio = this.codigoMunicipio();
      const exercicio_orcamento = this.anoExercicioOrcamento();

      if (codigo_municipio && exercicio_orcamento) {
        const unidadesGestoras = await this.tceQueries.fetchUnidadesGestoras({
          codigo_municipio,
          exercicio_orcamento
        });
        this.unidadesGestoras.set(unidadesGestoras);
      } else {
        this.unidadesGestoras.set([]);
      }
    });

    effect(() => {
      if (this.unidadesGestoras().length === 0) this.control().disable();
      else this.control().enable();
    });
  }

  toggleSelectAll(): void {
    if (this.control().value.length === this.unidadesGestoras().length) {
      this.control().setValue([]);
    } else {
      this.control().setValue(
        this.unidadesGestoras().map((ug) => ug.codigo_unidade_gestora)
      );
    }
  }
}
