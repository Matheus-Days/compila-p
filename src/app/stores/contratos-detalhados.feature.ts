import {
  patchState,
  signalStoreFeature,
  withMethods,
  withState
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { TceQueriesService } from '../services/tce-queries.service';
import {
  Contratados,
  Contrato,
  ContratoQueryParams
} from '../services/tce.types';
import { DateRange } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { WorksheetStoreState } from './workbooks.utils';

type ContratosDetalhadosState = {
  contratosDetalhados: WorksheetStoreState<ContratoDetalhado>;
};

export const INITIAL_HEADERS_ORDER: (keyof ContratoDetalhado)[] = [
  'numero_contrato',
  'numero_contrato_original',
  'data_contrato',
  'data_contrato_original',
  'data_fim_vigencia_contrato',
  'data_inicio_vigencia_contrato',
  'descricao_objeto_contrato',
  'tipo_contrato',
  'modalidade_contrato',
  'valor_total_contrato',
  'numero_documento_negociante',
  'nome_negociante',
  'codigo_tipo_negociante',
  'cep_negociante',
  'endereco_negociante',
  'nome_municipio_negociante',
  'codigo_uf',
  'fone_negociante'
];

const INITIAL_STATE: ContratosDetalhadosState = {
  contratosDetalhados: {
    data: [],
    headers: INITIAL_HEADERS_ORDER,
    message: '',
    progress: -1,
    status: 'idle'
  }
};

export function withContratosDetalhados() {
  return signalStoreFeature(
    withState(INITIAL_STATE),

    withMethods((store, tceQueriesService = inject(TceQueriesService)) => ({
      changeContratosDetalhadosHeadersOrder(
        headers: (keyof ContratoDetalhado)[]
      ) {
        patchState(store, {
          contratosDetalhados: {
            ...store.contratosDetalhados(),
            headers
          }
        });
      },

      clearContratosDetalhados() {
        patchState(store, {
          contratosDetalhados: INITIAL_STATE.contratosDetalhados
        });
      },

      async fetchContratosDetalhados(params: ContratoQueryParams) {
        patchState(store, {
          contratosDetalhados: {
            ...store.contratosDetalhados(),
            message: 'Buscando...',
            status: 'loading'
          }
        });

        try {
          const contratos = await tceQueriesService.fetchContratos(params);
          const contratados = await tceQueriesService.fetchContratados(params);
          const contratosDetalhados = await generateContratoDetalhado({
            contratos,
            contratados
          });

          patchState(store, {
            contratosDetalhados: {
              ...store.contratosDetalhados(),
              data: contratosDetalhados,
              message: 'Busca concluída.',
              status: 'loaded'
            }
          });
        } catch (e) {
          console.error(e);
          patchState(store, {
            contratosDetalhados: {
              ...store.contratosDetalhados(),
              message: 'Erro durante busca.',
              status: 'error'
            }
          });
        }
      }
    }))
  );
}

export type ContratoDetalhado = Pick<
  Contrato,
  | 'data_contrato'
  | 'data_contrato_original'
  | 'data_fim_vigencia_contrato'
  | 'data_inicio_vigencia_contrato'
  | 'descricao_objeto_contrato'
  | 'modalidade_contrato'
  | 'numero_contrato'
  | 'numero_contrato_original'
  | 'tipo_contrato'
  | 'valor_total_contrato'
> &
  Pick<
    Contratados,
    | 'cep_negociante'
    | 'codigo_tipo_negociante'
    | 'codigo_uf'
    | 'endereco_negociante'
    | 'fone_negociante'
    | 'nome_municipio_negociante'
    | 'nome_negociante'
    | 'numero_documento_negociante'
  >;

export type GenerateContratoDetalhadoParams = {
  contratos: Contrato[];
  contratados: Contratados[];
};

async function generateContratoDetalhado(
  params: GenerateContratoDetalhadoParams
): Promise<ContratoDetalhado[]> {
  return new Promise<ContratoDetalhado[]>((resolve, reject) => {
    const worker = new Worker(
      new URL('./contrato-detalhado.worker', import.meta.url)
    );

    worker.onmessage = (event) => {
      resolve(event.data);
      worker.terminate();
    };

    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };

    worker.postMessage(params);
  });
}

export function formatRange(
  dateRange: DateRange<Date> | undefined,
  datePipe: DatePipe
): string {
  if (!dateRange) return '';

  const start = datePipe.transform(dateRange.start, 'yyyy-MM-dd');

  const end = datePipe.transform(dateRange.end, 'yyyy-MM-dd');

  return `${start}_${end}`;
}
