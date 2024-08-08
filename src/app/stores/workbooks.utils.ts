export type WorksheetStoreState<T> = {
  data: T[];
  headers: (keyof T)[];
  message: string;
  progress: number;
  status: 'idle' | 'loading' | 'loaded' | 'error';
};

export type WorksheetOption = 'contratos' | 'inf' | 'ne';

export type WorksheetOptionObject = {
  label: string;
  value: WorksheetOption;
};

export const WORKSHEET_OPTS_LABELS: Record<WorksheetOption, string> = {
  contratos: 'Contratos',
  inf: 'Itens de nota fiscal',
  ne: 'Notas de empenho'
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
  }
];
