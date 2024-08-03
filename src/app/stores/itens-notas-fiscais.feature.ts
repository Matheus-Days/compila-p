import {
  patchState,
  signalStoreFeature,
  withMethods,
  withState
} from '@ngrx/signals';
import {
  ItensNotasFiscais,
  ItensNotasFiscaisQueryParams,
} from '../services/tce.types';
import { StoreData } from './workbooks.utils';
import { TceQueriesService } from '../services/tce-queries.service';
import { inject } from '@angular/core';

type ItensNotasFiscaisState = {
  itensNotasFiscais: StoreData<ItensNotasFiscais>;
  exercicioOrcamento: string;
};

export function withItensNotasFiscais() {
  return signalStoreFeature(
    withState<ItensNotasFiscaisState>({
      itensNotasFiscais: {
        list: [],
        headers: INITIAL_HEADERS_ORDER,
        status: 'empty'
      },
      exercicioOrcamento: ''
    }),

    withMethods((store, tceQueriesService = inject(TceQueriesService)) => ({
      _patchItensNotasFiscaisStatus(
        status: StoreData<ItensNotasFiscais>['status']
      ) {
        patchState(store, {
          itensNotasFiscais: {
            list: store.itensNotasFiscais().list,
            headers: store.itensNotasFiscais().headers,
            status
          }
        });
      },

      clearItensNotasFiscais(resetHeaders = false) {
        patchState(store, {
          itensNotasFiscais: {
            list: [],
            headers: resetHeaders
              ? INITIAL_HEADERS_ORDER
              : store.itensNotasFiscais().headers,
            status: 'empty'
          }
        });
      },

      async fetchItensNotasFiscais(
        queryParams: ItensNotasFiscaisQueryParams
      ): Promise<void> {
        try {
          this._patchItensNotasFiscaisStatus('loading');

          const itensNotasFiscais =
            await tceQueriesService.fetchItensNotasFiscais(queryParams);

          patchState(store, {
            itensNotasFiscais: {
              list: itensNotasFiscais,
              headers: store.itensNotasFiscais().headers,
              status: 'loaded'
            }
          });
        } catch (e) {
          console.error(e);
          this._patchItensNotasFiscaisStatus('error');
        }
      },

      onExercicioOrcamentoChange(exercicioOrcamento: string) {
        patchState(store, { exercicioOrcamento });
      },

      onItensNotasFiscaisHeadersChange(
        headers: Array<keyof ItensNotasFiscais>
      ) {
        patchState(store, {
          itensNotasFiscais: {
            list: store.itensNotasFiscais().list,
            headers,
            status: store.itensNotasFiscais().status
          }
        });
      }
    }))
  );
}

export const INITIAL_HEADERS_ORDER: Array<keyof ItensNotasFiscais> = [
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
