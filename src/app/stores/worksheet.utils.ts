import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import {
  TceQueriesService,
  WorkerObservable
} from '../services/tce-queries.service';
import { WorkbooksStore } from './workbooks.store';

export type WorksheetStoreState<T> = {
  data: T[];
  headers: (keyof T)[];
  message: string;
  progress: number;
  status: 'idle' | 'loading' | 'loaded' | 'error';
};

export type WorksheetOption = 'contratos' | 'inf' | 'liquidacoes' | 'ne' | 'np';

export type WorksheetOptionObject = {
  label: string;
  value: WorksheetOption;
};

export type WorksheetResultData = Record<string, string | number>[];

export type WorksheetResult = {
  data: WorksheetResultData;
  headers: string[];
  type: WorksheetOption;
};

export type WorksheetStoreFetchFn<T, Params> = (
  params: Params,
  tceQueriesService: TceQueriesService
) => WorkerObservable<T[]>;

export const WORKSHEET_OPTS_LABELS: Record<WorksheetOption, string> = {
  contratos: 'Contratos',
  inf: 'Itens de nota fiscal',
  liquidacoes: 'Liquidações',
  ne: 'Notas de empenho',
  np: 'Notas de pagamento'
};

export const WORKSHEET_OPTIONS: WorksheetOptionObject[] = [
  {
    label: WORKSHEET_OPTS_LABELS['contratos'],
    value: 'contratos'
  },
  {
    label: WORKSHEET_OPTS_LABELS['inf'],
    value: 'inf'
  },
  {
    label: WORKSHEET_OPTS_LABELS['ne'],
    value: 'ne'
  },
  {
    label: WORKSHEET_OPTS_LABELS['liquidacoes'],
    value: 'liquidacoes'
  },
  {
    label: WORKSHEET_OPTS_LABELS['np'],
    value: 'np'
  }
];

export function createWorksheetStore<T, P>(
  initialState: WorksheetStoreState<T>,
  fetchFn: WorksheetStoreFetchFn<T, P>,
  worksheetType: WorksheetOption
) {
  return signalStore(
    withState(initialState),

    withMethods(
      (
        store,
        tceQueriesService = inject(TceQueriesService),
        workbookStore = inject(WorkbooksStore)
      ) => ({
        changeHeadersOrder(headers: typeof initialState.headers) {
          patchState(store, {
            headers
          });
        },

        clear() {
          workbookStore.removeWorksheetResult(worksheetType);
          patchState(store, initialState);
        },

        fetchData(params: P) {
          patchState(store, { message: 'Buscando...', status: 'loading' });

          fetchFn(params, tceQueriesService).subscribe({
            next: (res) => {
              patchState(store, {
                data: res.data,
                progress: res.progress
              });
            },
            error: (e) => {
              console.error(e);
              patchState(store, {
                message: 'Erro durante busca.',
                status: 'error'
              });
            },
            complete: () => {
              workbookStore.addWorksheetResult({
                data: store.data() as WorksheetResultData,
                headers: ensureHeadersType(store.headers()),
                type: worksheetType
              });

              patchState(store, {
                message: 'Busca concluída.',
                status: 'loaded'
              });
            }
          });
        }
      })
    )
  );
}

const ensureHeadersType = (headers: (string | number | symbol)[]): string[] => {
  return headers.map((header) => header.toString());
};
