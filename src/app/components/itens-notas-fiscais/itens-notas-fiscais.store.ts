import {
  ItensNotasFiscais,
  ItensNotasFiscaisQueryParams
} from '../../services/tce.types';
import {
  createWorksheetStore,
  WorksheetStoreState
} from '../../stores/worksheet.utils';

type ItensNotasFiscaisState = WorksheetStoreState<ItensNotasFiscais>;

export const INITIAL_HEADERS_ORDER: (keyof ItensNotasFiscais)[] = [
  'numero_item_sequencial',
  'descricao1_item',
  'descricao2_item',
  'valor_unitario_item',
  'numero_quantidade_comprada',
  'valor_total_item',
  'data_emissao',
  'data_liquidacao',
  'codigo_orgao',
  'codigo_unidade',
  'unidade_compra',
  'codigo_ncm',
  'numero_nota_empenho',
  'numero_nota_fiscal',
  'tipo_nota_fiscal',
  'exercicio_orcamento'
];

const INITIAL_STATE: ItensNotasFiscaisState = {
  data: [],
  headers: INITIAL_HEADERS_ORDER,
  message: '',
  progress: -1,
  status: 'idle'
};

export const ItensNotasFicaisStore = createWorksheetStore<
  ItensNotasFiscais,
  ItensNotasFiscaisQueryParams
>(
  INITIAL_STATE,
  (params, tceQueriesService) =>
    tceQueriesService.fetchItensNotasFiscais(params),
  'inf'
);
