import {
  NotaPagamento,
  NotasPagamentosQueryParams
} from '../../services/tce.types';
import {
  createWorksheetStore,
  WorksheetStoreState
} from '../../stores/worksheet.utils';

type NotasPagamentosState = WorksheetStoreState<NotaPagamento>;

const INITIAL_HEADERS_ORDER: (keyof NotaPagamento)[] = [
  'numero_nota_pagamento',
  'numero_empenho',
  'numero_sub_empenho',
  'valor_empenhado_a_pagar',
  'valor_nota_pagamento',
  'data_nota_pagamento',
  'nome_pagador',
  'codigo_municipio',
  'codigo_orgao',
  'codigo_unidade',
  'cpf_pagador',
  'data_emissao_empenho',
  'data_referencia',
  'estado_de_estornado',
  'exercicio_orcamento',
  'nu_documento_caixa'
];

const INITIAL_STATE: NotasPagamentosState = {
  data: [],
  headers: INITIAL_HEADERS_ORDER,
  message: '',
  progress: -1,
  status: 'idle'
};

export const NotasPagamentosStore = createWorksheetStore<
  NotaPagamento,
  NotasPagamentosQueryParams
>(
  INITIAL_STATE,
  (params, tceQueriesService) => tceQueriesService.fetchNotasPagamentos(params),
  'np'
);
