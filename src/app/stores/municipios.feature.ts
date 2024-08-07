import {
  patchState,
  signalStoreFeature,
  withMethods,
  withState
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { TceQueriesService } from '../services/tce-queries.service';
import { Municipio } from '../services/tce.types';
import { WorksheetStoreState } from './workbooks.utils';

type MunicipiosState = {
  municipios: WorksheetStoreState<Municipio>;
};

const INITIAL_HEADERS_ORDER: (keyof Municipio)[] = [
  'codigo_municipio',
  'nome_municipio',
  'geoibgeId',
  'geonamesId'
];

const INITIAL_STATE: MunicipiosState = {
  municipios: {
    data: [],
    headers: INITIAL_HEADERS_ORDER,
    message: '',
    progress: -1,
    status: 'idle'
  }
};

export function withMunicipios() {
  return signalStoreFeature(
    withState(INITIAL_STATE),

    withMethods((store, tceQueriesService = inject(TceQueriesService)) => ({
      async fetchMunicipios() {
        patchState(store, {
          municipios: {
            ...store.municipios(),
            message: 'Carregando municípios...',
            status: 'loading'
          }
        });

        try {
          const municipios = await tceQueriesService.fetchMunicipios();

          patchState(store, {
            municipios: {
              ...store.municipios(),
              data: municipios,
              message: 'Municípios prontos.',
              status: 'loaded'
            }
          });
        } catch (e) {
          console.error(e);
          patchState(store, {
            municipios: {
              ...store.municipios(),
              message: 'Erro ao carregar municípios.',
              status: 'error'
            }
          });
        }
      },

      changeMunicipiosHeadersOrder(headers: (keyof Municipio)[]) {
        patchState(store, {
          municipios: {
            ...store.municipios(),
            headers
          }
        });
      }
    }))
  );
}
