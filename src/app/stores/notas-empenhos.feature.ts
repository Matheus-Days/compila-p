import {
  patchState,
  signalStoreFeature,
  withMethods,
  withState
} from '@ngrx/signals';
import { NotasEmpenhos, NotasEmpenhosQueryParams } from '../services/tce.types';
import { StoreData } from './workbooks.utils';
import { TceQueriesService } from '../services/tce-queries.service';
import { inject } from '@angular/core';

type NotasEmpenhosState = {
  notasEmpenhos: StoreData<NotasEmpenhos>;
};

export function withNotasEmpenhos() {
  return signalStoreFeature(
    withState<NotasEmpenhosState>({
      notasEmpenhos: {
        list: [],
        headers: INITIAL_HEADERS_ORDER,
        status: 'empty'
      },
    }),

    withMethods((store, tceQueriesService = inject(TceQueriesService)) => ({
      _patchNotasEmpenhosStatus(status: StoreData<NotasEmpenhos>['status']) {
        patchState(store, {
          notasEmpenhos: {
            list: store.notasEmpenhos().list,
            headers: store.notasEmpenhos().headers,
            status
          }
        });
      },

      clearNotasEmpenhos(resetHeaders = false) {
        patchState(store, {
          notasEmpenhos: {
            list: [],
            headers: resetHeaders
              ? INITIAL_HEADERS_ORDER
              : store.notasEmpenhos().headers,
            status: 'empty'
          }
        });
      },

      async fetchNotasEmpenhos(
        queryParams: NotasEmpenhosQueryParams
      ): Promise<void> {
        try {
          this._patchNotasEmpenhosStatus('loading');

          const data = await tceQueriesService.fetchNotasEmpenho(queryParams);

          patchState(store, {
            notasEmpenhos: {
              list: data,
              headers: store.notasEmpenhos().headers,
              status: 'loaded'
            }
          });
        } catch (e) {
          console.error(e);
          this._patchNotasEmpenhosStatus('error');
        }
      },

      onNotasEmpenhosHeadersChange(headers: Array<keyof NotasEmpenhos>) {
        patchState(store, {
          notasEmpenhos: {
            list: store.notasEmpenhos().list,
            headers,
            status: store.notasEmpenhos().status
          }
        });
      }
    }))
  );
}

export const INITIAL_HEADERS_ORDER: Array<keyof NotasEmpenhos> = [
  // 'codigo_municipio',
  // 'exercicio_orcamento',
  'numero_empenho',
  'descricao_empenho',
  'modalidade_empenho',
  'codigo_orgao',
  'codigo_unidade',
  'data_emissao_empenho',
  'data_referencia_empenho',
  'codigo_funcao',
  'codigo_subfuncao',
  'codigo_programa',
  'codigo_projeto_atividade',
  'numero_projeto_atividade',
  'numero_subprojeto_atividade',
  'codigo_elemento_despesa',
  'valor_anterior_saldo_dotacao',
  'valor_empenhado',
  'valor_atual_saldo_dotacao',
  'tipo_processo_licitatorio',
  'numero_documento_negociante',
  'estado_empenho',
  'numero_nota_anulacao',
  'data_emissao_empenho_substituto',
  'numero_empenho_substituto',
  'cd_cpf_gestor',
  'cpf_gestor_contrato',
  'codigo_tipo_negociante',
  'nome_negociante',
  'endereco_negociante',
  'fone_negociante',
  'cep_negociante',
  'nome_municipio_negociante',
  'codigo_uf',
  'tipo_fonte',
  'codigo_fonte',
  'codigo_contrato',
  'data_contrato',
  'numero_licitacao'
];
