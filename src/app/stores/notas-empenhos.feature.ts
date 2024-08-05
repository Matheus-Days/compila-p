import {
  patchState,
  signalStoreFeature,
  withMethods,
  withState
} from '@ngrx/signals';
import { NotasEmpenhos, NotasEmpenhosQueryParams } from '../services/tce.types';
import { TceQueriesService } from '../services/tce-queries.service';
import { inject } from '@angular/core';
import { WorksheetStoreState } from './workbooks.utils';

type NotasEmpenhosState = {
  notasEmpenhos: WorksheetStoreState<NotasEmpenhos>;
};

export const INITIAL_HEADERS_ORDER: (keyof NotasEmpenhos)[] = [
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

const INITIAL_STATE: NotasEmpenhosState = {
  notasEmpenhos: {
    data: [],
    headers: INITIAL_HEADERS_ORDER,
    message: '',
    progress: -1,
    status: 'idle'
  }
};

export function withNotasEmpenhos() {
  return signalStoreFeature(
    withState(INITIAL_STATE),

    withMethods((store, tceQueries = inject(TceQueriesService)) => ({
      changeNotasEmpenhosHeadersOrder(headers: (keyof NotasEmpenhos)[]) {
        patchState(store, {
          notasEmpenhos: {
            ...store.notasEmpenhos(),
            headers
          }
        });
      },

      clearNotasEmpenhos() {
        patchState(store, {
          notasEmpenhos: INITIAL_STATE.notasEmpenhos
        });
      },

      async fetchNotasEmpenhos(params: NotasEmpenhosQueryParams) {
        patchState(store, {
          notasEmpenhos: {
            ...store.notasEmpenhos(),
            status: 'loading',
            message: 'Buscando...'
          }
        });

        try {
          const data = await tceQueries.fetchNotasEmpenho(params);

          patchState(store, {
            notasEmpenhos: {
              ...store.notasEmpenhos(),
              data,
              status: 'loaded',
              message: 'Busca concluída.'
            }
          });
        } catch (e) {
          console.error(e);
          patchState(store, {
            notasEmpenhos: {
              ...store.notasEmpenhos(),
              status: 'error',
              message: 'Erro durante busca.'
            }
          });
        }
      }
    }))
  );
}
