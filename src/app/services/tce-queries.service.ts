import { Injectable } from '@angular/core';
import {
  Contratados,
  ContratadosQueryParams,
  Contrato,
  ItensNotasFiscais,
  ItensNotasFiscaisQueryParams,
  Municipio,
  NotasEmpenhos,
  NotasEmpenhosQueryParams,
  UnidadeGestora,
  UnidadesGestorasQueryParams
} from './tce.types';
import { FetchWorkerMessage, SearchParams } from './fetcher.worker';
import { EnhancedFetchWorkerResponse } from './enhanced-fetch.worker';
import { Observable } from 'rxjs';
import { stringifyParams } from './utils';

@Injectable({
  providedIn: 'root'
})
export class TceQueriesService {
  private readonly BASE_URL = '/api/tce';

  async fetchContratados(
    params: ContratadosQueryParams
  ): Promise<Contratados[]> {
    return fetchAll<Contratados[]>(`${this.BASE_URL}/contratados`, params);
  }

  async fetchContratos(params: ContratadosQueryParams): Promise<Contrato[]> {
    return fetchAll<Contrato[]>(`${this.BASE_URL}/contrato`, params);
  }

  async fetchItensNotasFiscais(
    params: ItensNotasFiscaisQueryParams
  ): Promise<ItensNotasFiscais[]> {
    return fetchAll<ItensNotasFiscais[]>(
      `${this.BASE_URL}/itens_notas_fiscais`,
      params
    );
  }

  async fetchMunicipios(): Promise<Municipio[]> {
    const response = await fetch(`${this.BASE_URL}/municipios`);
    const parsed = await response.json();
    return parsed.data;
  }

  async fetchNotasEmpenho(
    params: NotasEmpenhosQueryParams
  ): Promise<NotasEmpenhos[]> {
    return fetchAll<NotasEmpenhos[]>(`${this.BASE_URL}/notas_empenhos`, params);
  }

  fetchItensNotasFiscaisEnhanced(
    params: ItensNotasFiscaisQueryParams
  ): Observable<EnhancedFetchWorkerResponse<ItensNotasFiscais[]>> {
    return fetchAllEnhanced<ItensNotasFiscais[]>(
      `${this.BASE_URL}/itens_notas_fiscais`,
      params
    );
  }

  async fetchUnidadesGestoras(
    params: UnidadesGestorasQueryParams
  ): Promise<UnidadeGestora[]> {
    const paramsStr = new URLSearchParams(stringifyParams(params));
    const response = await fetch(
      `${this.BASE_URL}/unidades_gestoras?${paramsStr}`
    );
    const parsed = await response.json();
    return parsed.data;
  }
}

async function fetchAll<T>(
  url: string,
  searchParams: SearchParams
): Promise<T> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./fetcher.worker.ts', import.meta.url), {
      type: 'module'
    });

    worker.onmessage = ({ data }) => {
      resolve(data);
      worker.terminate();
    };
    worker.onerror = (e) => {
      reject(e);
      worker.terminate();
    };

    const message: FetchWorkerMessage = {
      url,
      searchParams
    };

    worker.postMessage(message);
  });
}

function fetchAllEnhanced<T>(
  url: string,
  searchParams: SearchParams
): Observable<EnhancedFetchWorkerResponse<T>> {
  const worker = new Worker(
    new URL('./enhanced-fetch.worker.ts', import.meta.url),
    {
      type: 'module'
    }
  );

  const fetchAll$ = new Observable<EnhancedFetchWorkerResponse<T>>(
    (subscribe) => {
      worker.onmessage = ({
        data
      }: MessageEvent<EnhancedFetchWorkerResponse<T>>) => {
        subscribe.next(data);
        if (data.progress === 1) {
          subscribe.complete();
        }
      };

      worker.onerror = (e) => {
        subscribe.error(e);
      };

      const message: FetchWorkerMessage = {
        url,
        searchParams
      };

      worker.postMessage(message);
    }
  );

  fetchAll$.subscribe({
    error: () => worker.terminate(),
    complete: () => worker.terminate()
  });

  return fetchAll$;
}
