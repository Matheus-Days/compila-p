import { Injectable } from '@angular/core';
import {
  Contratados,
  ContratadosQueryParams,
  Contrato,
  ItensNotasFiscais,
  ItensNotasFiscaisQueryParams,
  Liquidacao,
  LiquidacoesQueryParams,
  Municipio,
  NotaPagamento,
  NotasEmpenhos,
  NotasEmpenhosQueryParams,
  NotasPagamentosQueryParams,
  UnidadeGestora,
  UnidadesGestorasQueryParams
} from './tce.types';
import { FetchWorkerMessage, SearchParams } from './fetcher.worker';
import { EnhancedFetchWorkerResponse } from './enhanced-fetch.worker';
import { Observable, tap } from 'rxjs';
import { stringifyParams } from './utils';

export type WorkerObservable<T> = Observable<EnhancedFetchWorkerResponse<T>>;

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

  fetchItensNotasFiscais(
    params: ItensNotasFiscaisQueryParams
  ): WorkerObservable<ItensNotasFiscais[]> {
    return fetchAllEnhanced<ItensNotasFiscais[]>(
      `${this.BASE_URL}/itens_notas_fiscais`,
      params
    );
  }

  fetchLiquidacoes(
    params: LiquidacoesQueryParams
  ): WorkerObservable<Liquidacao[]> {
    return fetchAllEnhanced<Liquidacao[]>(
      `${this.BASE_URL}/liquidacoes`,
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

  fetchNotasPagamentos(
    params: NotasPagamentosQueryParams
  ): WorkerObservable<NotaPagamento[]> {
    return fetchAllEnhanced<NotaPagamento[]>(
      `${this.BASE_URL}/notas_pagamentos`,
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

  let progress = 0;

  const fetchAll$ = new Observable<EnhancedFetchWorkerResponse<T>>(
    (subscribe) => {
      worker.onmessage = ({
        data
      }: MessageEvent<EnhancedFetchWorkerResponse<T>>) => {
        progress = progress > data.progress ? progress : data.progress;
        subscribe.next({
          data: data.data,
          progress
        });
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
  ).pipe(
    tap({
      error: () => worker.terminate(),
      complete: () => worker.terminate()
    })
  );

  return fetchAll$;
}
