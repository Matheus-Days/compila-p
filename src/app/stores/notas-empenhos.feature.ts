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
import { MonthValue } from '../components/months-select/months-select.component';

type NotasEmpenhosState = {
  notasEmpenhos: WorksheetStoreState<NotasEmpenhos>;
};

export type DataReferenciaEmpenho = {
  ano: number;
  meses: MonthValue[];
};

export type CustomNotasEmpenhosQueryParams = Omit<
  NotasEmpenhosQueryParams,
  'data_referencia_empenho' | 'codigo_orgao' | 'quantidade' | 'deslocamento'
> & {
  dre: DataReferenciaEmpenho;
  codigosOrgaos: number[];
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

      async fetchNotasEmpenhos(customParams: CustomNotasEmpenhosQueryParams) {
        patchState(store, {
          notasEmpenhos: {
            ...store.notasEmpenhos(),
            status: 'loading',
            message: 'Buscando...'
          }
        });

        try {
          const queue = prepareQueries(customParams);

          const requests = queue.map((params) => tceQueries.fetchNotasEmpenho(params));
          const responses = await Promise.all(requests);
          const data = responses.flat();

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

function transformCodigoOrgao(cod: number): string {
  return cod.toString().padStart(2, '0');
}

/**
 * Formats year and month for API request param **data_referencia_empenho**.
 * @returns Date formatted as `YYYYMM`
 */
function transformDRE(year: number, month: string): string {
  return `${year}${month}`;
}

function transformParams(
  codigoOrgao: number,
  dre: { ano: number; mes: string },
  customParams: CustomNotasEmpenhosQueryParams
): NotasEmpenhosQueryParams {
  const params: NotasEmpenhosQueryParams = {
    codigo_orgao: transformCodigoOrgao(codigoOrgao),
    data_referencia_empenho: transformDRE(dre.ano, dre.mes),
    quantidade: 100,
    deslocamento: 0,
    codigo_municipio: customParams.codigo_municipio
  };

  if (customParams.codigo_tipo_negociante)
    params.codigo_tipo_negociante = customParams.codigo_tipo_negociante;

  if (customParams.codigo_uf) params.codigo_uf = customParams.codigo_uf;

  if (customParams.codigo_uf) params.codigo_uf = customParams.codigo_uf;

  if (customParams.codigo_unidade)
    params.codigo_unidade = customParams.codigo_unidade;

  if (customParams.data_emissao_empenho)
    params.data_emissao_empenho = customParams.data_emissao_empenho;

  if (customParams.nome_municipio_negociante)
    params.nome_municipio_negociante = customParams.nome_municipio_negociante;

  if (customParams.nome_negociante)
    params.nome_negociante = customParams.nome_negociante;

  if (customParams.numero_documento_negociante)
    params.numero_documento_negociante =
      customParams.numero_documento_negociante;

  if (customParams.numero_empenho)
    params.numero_empenho = customParams.numero_empenho;

  if (customParams.numero_licitacao)
    params.numero_licitacao = customParams.numero_licitacao;

  return params;
}

function prepareQueries(
  params: CustomNotasEmpenhosQueryParams
): NotasEmpenhosQueryParams[] {
  const paramsQueue: NotasEmpenhosQueryParams[] = [];

  params.dre.meses.forEach((mes) => {
    params.codigosOrgaos.forEach((cod) => {
      paramsQueue.push(
        transformParams(cod, { ano: params.dre.ano, mes }, params)
      );
    });
  });

  return paramsQueue;
}
