import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { withMunicipios } from './municipios.feature';
import { WorkBook } from 'xlsx';
import { WorkbookService } from '../services/workbook.service';
import { WorkbookWorkerMessage } from '../services/workbook.worker';
import {
  WORKSHEET_OPTS_LABELS,
  WorksheetOption,
  WorksheetResult
} from './worksheet.utils';

type WorkbookState = {
  message: string;
  selectedWorksheetOpts: WorksheetOption[];
  selectedWorksheetResults: WorksheetOption[];
  status: 'idle' | 'creating' | 'downloading';
  workbook: WorkBook | undefined;
  worksheetResults: WorksheetResult[];
};

const INITIAL_STATE: WorkbookState = {
  message: '',
  selectedWorksheetOpts: [],
  selectedWorksheetResults: [],
  status: 'idle',
  workbook: undefined,
  worksheetResults: []
};

export const WorkbooksStore = signalStore(
  { providedIn: 'root' },

  withState(INITIAL_STATE),

  withMunicipios(),

  withMethods((store, workbookService = inject(WorkbookService)) => ({
    addWorksheetResult(result: WorksheetResult) {
      const currResults = store.worksheetResults();

      const existingResultIndex = currResults.findIndex(
        (r) => r.type === result.type
      );

      if (existingResultIndex !== -1) {
        currResults[existingResultIndex] = result;
      } else {
        currResults.push(result);
      }

      patchState(store, { worksheetResults: [...currResults] });
    },

    removeWorksheetResult(type: WorksheetOption) {
      patchState(store, {
        worksheetResults: store
          .worksheetResults()
          .filter((result) => result.type !== type)
      });
    },

    clear() {
      patchState(store, INITIAL_STATE);
    },

    async createWorkbook(): Promise<void> {
      const selectedWorksheets = store.selectedWorksheetResults();

      const worksheets: WorkbookWorkerMessage['worksheets'] = store
        .worksheetResults()
        .filter((res) => selectedWorksheets.includes(res.type))
        .map((res) => {
          return {
            name: WORKSHEET_OPTS_LABELS[res.type],
            data: res.data,
            header: res.headers
          };
        });

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
