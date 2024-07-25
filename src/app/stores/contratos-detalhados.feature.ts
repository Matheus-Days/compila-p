import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState
} from '@ngrx/signals';
import { StoreData } from './workbooks.utils';
import { computed, inject } from '@angular/core';
import { TceQueriesService } from '../services/tce-queries.service';
import {
  Contratados,
  Contrato,
  ContratoQueryParams
} from '../services/tce.types';
import { DateRange } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';

type ContratosDetalhadosState = {
  contratosDetalhados: StoreData<ContratoDetalhado>;
  selectedDateRange: DateRange<Date> | undefined;
};

export function withContratosDetalhados() {
  return signalStoreFeature(
    withState<ContratosDetalhadosState>({
      contratosDetalhados: {
        list: [],
        headers: INITIAL_HEADERS_ORDER,
        status: 'empty'
      },
      selectedDateRange: undefined
    }),

    withComputed((store, date = inject(DatePipe)) => ({
      _selectedDateRange: computed(() => {
        const dateRange = store.selectedDateRange();
        if (!dateRange) return '';

        const start = date.transform(dateRange.start, 'yyyy-MM-dd');

        const end = date.transform(dateRange.end, 'yyyy-MM-dd');

        return `${start}_${end}`;
      })
    })),

    withMethods((store, tceQueriesService = inject(TceQueriesService)) => ({
      _patchContratosDetalhadosStatus(
        status: StoreData<ContratoDetalhado>['status']
      ) {
        patchState(store, {
          contratosDetalhados: {
            list: store.contratosDetalhados().list,
            headers: store.contratosDetalhados().headers,
            status
          }
        });
      },

      clearContratosDetalhados(resetHeaders = false) {
        patchState(store, {
          contratosDetalhados: {
            list: [],
            headers: resetHeaders
              ? INITIAL_HEADERS_ORDER
              : store.contratosDetalhados().headers,
            status: 'empty'
          }
        });
      },

      async fetchContratosDetalhados(codigo_municipio: string) {
        this._patchContratosDetalhadosStatus('loading');

        const selectedDateRange = store._selectedDateRange();
        if (!selectedDateRange) this._patchContratosDetalhadosStatus('error');

        const params: ContratoQueryParams = {
          codigo_municipio,
          data_contrato: selectedDateRange,
          deslocamento: 0,
          quantidade: 100
        };

        try {
          const contratos = await tceQueriesService.fetchContratos(params);
          const contratados = await tceQueriesService.fetchContratados(params);
          const contratosDetalhados = await generateContratoDetalhado({
            contratos,
            contratados
          });

          patchState(store, {
            contratosDetalhados: {
              list: contratosDetalhados,
              headers: store.contratosDetalhados().headers,
              status: 'loaded'
            }
          });
        } catch (e) {
          console.error(e);
          this._patchContratosDetalhadosStatus('error');
        }
      },

      onDateRangeChange(dateRange: DateRange<Date>) {
        patchState(store, {
          selectedDateRange: dateRange
        });
      },

      onContratosDetalhadosHeadersChange(
        headers: Array<keyof ContratoDetalhado>
      ) {
        patchState(store, {
          contratosDetalhados: {
            list: store.contratosDetalhados().list,
            headers,
            status: store.contratosDetalhados().status
          }
        });
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

export const INITIAL_HEADERS_ORDER: Array<keyof ContratoDetalhado> = [
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
