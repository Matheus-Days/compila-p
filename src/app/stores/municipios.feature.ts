import {
  patchState,
  signalStoreFeature,
  withMethods,
  withState
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { TceQueriesService } from '../services/tce-queries.service';
import { Municipio } from '../services/tce.types';
import { StoreData } from './workbooks.utils';

type MunicipiosState = {
  municipios: StoreData<Municipio>;
  selectedMunicipio: Municipio | undefined;
};

const INITIAL_HEADERS_ORDER: Array<keyof Municipio> = [
  'codigo_municipio',
  'nome_municipio',
  'geoibgeId',
  'geonamesId'
];

export function withMunicipios() {
  return signalStoreFeature(
    withState<MunicipiosState>({
      municipios: {
        list: [],
        headers: INITIAL_HEADERS_ORDER,
        status: 'empty'
      },
      selectedMunicipio: undefined
    }),

    withMethods((store, tceQueriesService = inject(TceQueriesService)) => ({
      _patchMunicipiosStatus(status: StoreData<Municipio>['status']) {
        patchState(store, {
          municipios: {
            list: store.municipios().list,
            headers: store.municipios().headers,
            status
          }
        });
      },

      async fetchMunicipios() {
        this._patchMunicipiosStatus('loading');

        try {
          const municipios = await tceQueriesService.fetchMunicipios();

          patchState(store, {
            municipios: {
              list: municipios,
              headers: store.municipios().headers,
              status: 'loaded'
            }
          });
        } catch (error) {
          console.error(error);
          this._patchMunicipiosStatus('error');
        }
      },

      onMunicipioSelected(municipio: Municipio) {
        patchState(store, {
          selectedMunicipio: municipio
        });
      },

      patchMunicipiosHeaders(headers: Array<keyof Municipio>) {
        patchState(store, {
          municipios: {
            list: store.municipios().list,
            headers,
            status: store.municipios().status
          }
        });
      },

      resetMunicipios(resetHeaders = false) {
        patchState(store, {
          municipios: {
            list: [],
            headers: resetHeaders
              ? INITIAL_HEADERS_ORDER
              : store.municipios().headers,
            status: 'empty'
          }
        });
      }
    }))
  );
}
