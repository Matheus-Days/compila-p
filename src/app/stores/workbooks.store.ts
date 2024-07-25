import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState
} from '@ngrx/signals';
import {
  ContratoDetalhado,
  withContratosDetalhados
} from './contratos-detalhados.feature';
import { computed, inject } from '@angular/core';
import { withMunicipios } from './municipios.feature';
import { StoreData } from './workbooks.utils';
import { Municipio } from '../services/tce.types';
import { WorkBook } from 'xlsx';
import { WorkbookService } from '../services/workbook.service';

type WorkbookStoreStatus =
  | 'NOT_READY'
  | 'LOADING_MUNICIPIOS'
  | 'LOADED_MUNICIPIOS'
  | 'ERROR_MUNICIPIOS'
  | 'LOADING_CONTRATOS_DETALHADOS'
  | 'LOADED_CONTRATOS_DETALHADOS'
  | 'ERROR_CONTRATOS_DETALHADOS'
  | 'CREATING_CONTRATOS_DETALHADOS'
  | 'DOWNLOADING_CONTRATOS_DETALHADOS'
  | 'LOADING_NOTAS_EMPENHOS'
  | 'LOADED_NOTAS_EMPENHOS'
  | 'ERROR_NOTAS_EMPENHOS'
  | 'UNKNOWN_STATUS';

type WorkbookState = {
  workbook: WorkBook | undefined;
  _status: 'idle' | 'creating' | 'downloading';
};

export const WorkbooksStore = signalStore(
  { providedIn: 'root' },

  withState<WorkbookState>({
    workbook: undefined,
    _status: 'idle'
  }),

  withMunicipios(),

  withContratosDetalhados(),

  withComputed((store) => {
    const status = computed<WorkbookStoreStatus>(() =>
      calculateStatus(
        store.municipios(),
        store.contratosDetalhados(),
        store._status()
      )
    );

    const statusMessage = computed(() => calculateStatusMessage(status()));

    return {
      status,
      statusMessage
    };
  }),

  withMethods((store, workbookService = inject(WorkbookService)) => ({
    clear() {
      store.clearContratosDetalhados();
      patchState(store, {
        selectedDateRange: undefined,
        selectedMunicipio: undefined
      });
    },

    async createWorkbook() {
      const contratosDetalhados = store.contratosDetalhados().list;

      if (contratosDetalhados.length === 0)
        throw new Error('Lista de contratos detalhados vazia.');

      patchState(store, { _status: 'creating' });
      const workbook = await workbookService.createWorkbook({
        data: contratosDetalhados,
        header: store.contratosDetalhados().headers
      });

      patchState(store, {
        workbook,
        _status: 'idle'
      });
    },

    async downloadWorkbook(name = 'planilhas.xlsx') {
      const workbook = store.workbook();
      if (!workbook) return;

      patchState(store, { _status: 'downloading' });
      await workbookService.downloadWorkbook(workbook, name);
      patchState(store, { _status: 'idle' });
    },

    async fetchWorkbookData() {
      const municipio = store.selectedMunicipio();

      if (!municipio) throw new Error('Nenhum município não selecionado.');

      await store.fetchContratosDetalhados(municipio.codigo_municipio);
    }
  })),

  withHooks((store) => ({
    onInit() {
      store.fetchMunicipios();
    }
  }))
);

function calculateStatus(
  municipios: StoreData<Municipio>,
  contratosDetalhados: StoreData<ContratoDetalhado>,
  status: WorkbookState['_status']
): WorkbookStoreStatus {
  if (status === 'creating') return 'CREATING_CONTRATOS_DETALHADOS';
  if (status === 'downloading') return 'DOWNLOADING_CONTRATOS_DETALHADOS';
  if (contratosDetalhados.status === 'loading')
    return 'LOADING_CONTRATOS_DETALHADOS';
  if (contratosDetalhados.status === 'loaded')
    return 'LOADED_CONTRATOS_DETALHADOS';
  if (contratosDetalhados.status === 'error')
    return 'ERROR_CONTRATOS_DETALHADOS';
  if (municipios.status === 'empty') return 'NOT_READY';
  if (municipios.status === 'loading') return 'LOADING_MUNICIPIOS';
  if (municipios.status === 'error') return 'ERROR_MUNICIPIOS';
  else return 'UNKNOWN_STATUS';
}

function calculateStatusMessage(status: WorkbookStoreStatus): string {
  switch (status) {
    case 'NOT_READY':
      return 'Municípios não carregados.';
    case 'LOADING_MUNICIPIOS':
      return 'Buscando municípios...';
    case 'LOADING_CONTRATOS_DETALHADOS':
      return 'Buscando contratos detalhados...';
    case 'LOADING_NOTAS_EMPENHOS':
      return 'Buscando notas de empenho...';
    case 'LOADED_MUNICIPIOS':
      return '';
    case 'LOADED_CONTRATOS_DETALHADOS':
    case 'LOADED_NOTAS_EMPENHOS':
      return 'Busca finalizada.';
    case 'ERROR_MUNICIPIOS':
      return 'Erro ao carregar municípios.';
    case 'ERROR_CONTRATOS_DETALHADOS':
      return 'Erro ao buscar contratos.';
    case 'ERROR_NOTAS_EMPENHOS':
      return 'Erro ao buscar notas de empenho.';
    case 'CREATING_CONTRATOS_DETALHADOS':
      return 'Gerando planilha...';
    case 'DOWNLOADING_CONTRATOS_DETALHADOS':
      return 'Baixando planilha...';
    default:
      return '';
  }
}
