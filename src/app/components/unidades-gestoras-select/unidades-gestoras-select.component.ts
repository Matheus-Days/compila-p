import { Component, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { map } from 'rxjs';
import { UnidadeGestora } from '../../services/tce.types';
import { TceQueriesService } from '../../services/tce-queries.service';
import { WorkbooksStore } from '../../stores/workbooks.store';

export type FixedUnidadeGestora = Omit<
  UnidadeGestora,
  'codigo_unidade_gestora'
> & {
  codigo_unidade_gestora: string;
};

const fixCodUG = (ug: UnidadeGestora): FixedUnidadeGestora => ({
  ...ug,
  codigo_unidade_gestora: ug.codigo_unidade_gestora.toString().padStart(2, '0')
});

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
  workbookStore = inject(WorkbooksStore)
  tceQueries = inject(TceQueriesService);

  label = input('Unidade Gestora');
  multiple = input(false);
  disableSelectAll = input(false);
  control = input<FormControl>(new FormControl(this.multiple() ? [] : '00'));
  codigoMunicipio = input('', { transform: (val) => String(val) });
  nomeMunicipio = input('');
  anoExercicioOrcamento = input('', { transform: (val) => String(val) + '00' });
  hint = input('');

  isAllSelected = toSignal(
    this.control().valueChanges.pipe(
      map((val) => val.length === this.unidadesGestoras.length)
    )
  );

  unidadesGestoras = signal<FixedUnidadeGestora[]>([]);

  constructor() {
    effect(
      async () => {
        const exercicio_orcamento = this.anoExercicioOrcamento();

        const year = parseInt(exercicio_orcamento.substring(0, 4));
        if (year <= 2007) {
          this.control().disable();
        } else {
          this.control().enable();
        }

        let codigo_municipio = '';

        if (this.codigoMunicipio()) codigo_municipio = this.codigoMunicipio();
        else {
          const municipio = this.workbookStore.municipios().data.find(m => m.nome_municipio === this.nomeMunicipio())
          if (municipio) codigo_municipio = municipio.codigo_municipio;
        }

        if (codigo_municipio && exercicio_orcamento) {
          const unidadesGestoras = await this.tceQueries.fetchUnidadesGestoras({
            codigo_municipio,
            exercicio_orcamento
          });
          const fixed = unidadesGestoras.map(fixCodUG);
          this.unidadesGestoras.set(fixed);
        } else {
          this.unidadesGestoras.set([]);
        }
      },
      { allowSignalWrites: true }
    );

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
