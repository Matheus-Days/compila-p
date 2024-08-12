import { createWorksheetStore, WorksheetStoreState } from '../../stores/worksheet.utils';
import { Liquidacao, LiquidacoesQueryParams } from '../../services/tce.types';

type LiquidacoesState = WorksheetStoreState<Liquidacao>;

const INITIAL_HEADERS_ORDER: (keyof Liquidacao)[] = [
  'codigo_municipio',
  'codigo_orgao',
  'codigo_unidade',
  'data_emissao_empenho',
  'data_liquidacao',
  'data_referencia_liquidacao',
  'estado_de_estorno',
  'estado_folha',
  'exercicio_orcamento',
  'nome_responsavel_liquidacao',
  'numero_empenho',
  'numero_sub_empenho_liquidacao',
  'valor_liquidado'
];

const INITIAL_STATE: LiquidacoesState = {
  data: [],
  headers: INITIAL_HEADERS_ORDER,
  message: '',
  progress: -1,
  status: 'idle'
};

export const LiquidacoesStore = createWorksheetStore<
  Liquidacao,
  LiquidacoesQueryParams
>(INITIAL_STATE, (params, tceQueriesService) =>
  tceQueriesService.fetchLiquidacoes(params),
  'liquidacoes'
);
