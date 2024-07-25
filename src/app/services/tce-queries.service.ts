import { Injectable } from '@angular/core';
import {
  Contratados,
  ContratadosQueryParams,
  Contrato,
  ItensNotasFiscais,
  ItensNotasFiscaisQueryParams,
  Municipio,
  NotasEmpenhos,
  NotasEmpenhosQueryParams
} from './tce.types';
import { FetchWorkerMessage, SearchParams } from './fetcher.worker';

@Injectable({
  providedIn: 'root'
})
export class TceQueriesService {
  private readonly BASE_URL = '/tce';
  private municipios: Municipio[] = [];

  constructor() {}

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
    if (this.municipios.length === 0) {
      const response = await fetch(`${this.BASE_URL}/municipios`);
      const parsed = await response.json();
      this.municipios = parsed.data;
    }
    return this.municipios;
  }

  async fetchNotasEmpenho(
    params: NotasEmpenhosQueryParams
  ): Promise<NotasEmpenhos[]> {
    return fetchAll<NotasEmpenhos[]>(`${this.BASE_URL}/notas_empenhos`, params);
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
    }

    const message: FetchWorkerMessage = {
      url,
      searchParams
    };

    worker.postMessage(message);
  });
}
