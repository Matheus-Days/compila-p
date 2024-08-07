import {
  patchState,
  signalStoreFeature,
  withMethods,
  withState
} from '@ngrx/signals';
import {
  ItensNotasFiscais,
  ItensNotasFiscaisQueryParams
} from '../services/tce.types';
import { WorksheetStoreState } from './workbooks.utils';
import { TceQueriesService } from '../services/tce-queries.service';
import { inject } from '@angular/core';

type ItensNotasFiscaisState = {
  itensNotasFiscais: WorksheetStoreState<ItensNotasFiscais>;
};

export const INITIAL_HEADERS_ORDER: (keyof ItensNotasFiscais)[] = [
  'numero_item_sequencial',
  'descricao1_item',
  'descricao2_item',
  'valor_unitario_item',
  'numero_quantidade_comprada',
  'valor_total_item',
  'data_emissao',
  'data_liquidacao',
  'codigo_orgao',
  'codigo_unidade',
  'unidade_compra',
  'codigo_ncm',
  'numero_nota_empenho',
  'numero_nota_fiscal',
  'tipo_nota_fiscal',
  'exercicio_orcamento'
];

const INITIAL_STATE: ItensNotasFiscaisState = {
  itensNotasFiscais: {
    data: [],
    headers: INITIAL_HEADERS_ORDER,
    message: '',
    progress: -1,
    status: 'idle'
  }
};

export function withItensNotasFiscais() {
  return signalStoreFeature(
    withState(INITIAL_STATE),

    withMethods((store, tceQueriesService = inject(TceQueriesService)) => ({
      changeItensNotasFiscaisHeadersOrder(
        headers: (keyof ItensNotasFiscais)[]
      ) {
        patchState(store, {
          itensNotasFiscais: {
            ...store.itensNotasFiscais(),
            headers
          }
        });
      },

      clearItensNotasFiscais() {
        patchState(store, {
          itensNotasFiscais: INITIAL_STATE.itensNotasFiscais
        });
      },

      async fetchItensNotasFiscais(
        queryParams: ItensNotasFiscaisQueryParams
      ): Promise<void> {
        patchState(store, {
          itensNotasFiscais: {
            ...store.itensNotasFiscais(),
            message: 'Buscando...',
            status: 'loading'
          }
        });

        const itensNotasFiscais$ =
          tceQueriesService.fetchItensNotasFiscaisEnhanced(queryParams);

        itensNotasFiscais$.subscribe({
          next: (res) => {
            patchState(store, {
              itensNotasFiscais: {
                ...store.itensNotasFiscais(),
                data: res.data,
                progress: res.progress
              }
            });
          },
          error: (e) => {
            console.error(e);
            patchState(store, {
              itensNotasFiscais: {
                ...store.itensNotasFiscais(),
                message: 'Erro durante busca.',
                status: 'error'
              }
            });
          },
          complete: () => {
            patchState(store, {
              itensNotasFiscais: {
                ...store.itensNotasFiscais(),
                message: 'Busca concluída.',
                status: 'loaded'
              }
            });
          }
        });
      }
    }))
  );
}
