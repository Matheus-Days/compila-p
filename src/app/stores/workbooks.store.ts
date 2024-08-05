import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState
} from '@ngrx/signals';
import { withContratosDetalhados } from './contratos-detalhados.feature';
import { computed, inject } from '@angular/core';
import { withMunicipios } from './municipios.feature';
import { WorkBook } from 'xlsx';
import { WorkbookService } from '../services/workbook.service';
import { withItensNotasFiscais } from './itens-notas-fiscais.feature';
import { withNotasEmpenhos } from './notas-empenhos.feature';
import { WorkbookWorkerMessage } from '../services/workbook.worker';
import { WorksheetOption } from './workbooks.utils';

type WorkbookState = {
  message: string;
  selectedWorksheetOpts: WorksheetOption[];
  selectedWorksheetResults: WorksheetOption[];
  status: 'idle' | 'creating' | 'downloading';
  workbook: WorkBook | undefined;
};

export const WorkbooksStore = signalStore(
  { providedIn: 'root' },

  withState<WorkbookState>({
    message: '',
    selectedWorksheetOpts: [],
    selectedWorksheetResults: [],
    status: 'idle',
    workbook: undefined
  }),

  withMunicipios(),

  withContratosDetalhados(),

  withItensNotasFiscais(),

  withNotasEmpenhos(),

  withComputed((store) => {
    const availableWorksheets = computed<WorksheetOption[]>(() => {
      const worksheets: WorksheetOption[] = [];
      if (store.contratosDetalhados().status === 'loaded')
        worksheets.push('contratos');
      if (store.itensNotasFiscais().status === 'loaded') worksheets.push('inf');
      if (store.notasEmpenhos().status === 'loaded') worksheets.push('ne');
      return worksheets;
    });

    return {
      availableWorksheets
    };
  }),

  withMethods((store, workbookService = inject(WorkbookService)) => ({
    clear() {
      store.clearContratosDetalhados();
      store.clearItensNotasFiscais();
      store.clearNotasEmpenhos();
      patchState(store, {
        status: 'idle',
        message: '',
        selectedWorksheetOpts: [],
        workbook: undefined,
      });
    },

    async createWorkbook(): Promise<void> {
      const cd = store.contratosDetalhados();
      const inf = store.itensNotasFiscais();
      const ne = store.notasEmpenhos();
      const selectedWorksheets = store.selectedWorksheetResults();
      const worksheets: WorkbookWorkerMessage['worksheets'] = [];

      if (selectedWorksheets.includes('contratos')) {
        worksheets.push({
          name: 'Contratos',
          data: cd.data,
          header: cd.headers
        });
      }

      if (selectedWorksheets.includes('inf')) {
        worksheets.push({
          name: 'Itens de nota fiscal',
          data: inf.data,
          header: inf.headers
        });
      }

      if (selectedWorksheets.includes('ne')) {
        worksheets.push({
          name: 'Notas de empenho',
          data: ne.data,
          header: ne.headers
        });
      }

      patchState(store, { status: 'creating', message: 'Criando planilha...' });

      try {
        const workbook = await workbookService.createWorkbook({ worksheets });

        patchState(store, {
          workbook,
          message: 'Planilha criada com sucesso.',
          status: 'idle'
        });
      } catch (e) {
        console.error(e);
        patchState(store, {
          status: 'idle',
          message: 'Erro ao criar planilha.'
        });
      }
    },

    async downloadWorkbook(name = 'planilhas.xlsx') {
      const workbook = store.workbook();
      if (!workbook) return;

      patchState(store, {
        status: 'downloading',
        message: 'Baixando planilha...'
      });
      await workbookService.downloadWorkbook(workbook, name);
      patchState(store, {
        status: 'idle',
        message: 'Planilha baixada com sucesso.'
      });
    },

    selectWorksheetOpts(worksheets: WorksheetOption[]) {
      patchState(store, { selectedWorksheetOpts: worksheets });
    },

    selectWorksheetResults(worksheets: WorksheetOption[]) {
      patchState(store, { selectedWorksheetResults: worksheets });
    }
  })),

  withHooks((store) => ({
    onInit() {
      store.fetchMunicipios();
    }
  }))
);
