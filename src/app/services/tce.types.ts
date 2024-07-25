export type Municipio = {
  codigo_municipio: string;
  nome_municipio: string;
  geoibgeId: string;
  geonamesId: string;
}

export type MunicipioQueryParams = Partial<Municipio>;

export type Contrato = {
  codigo_municipio: string,
  data_contrato: string,
  numero_contrato: string,
  tipo_contrato: string,
  modalidade_contrato: string,
  numero_contrato_original: string,
  data_contrato_original: string,
  data_inicio_vigencia_contrato: string,
  data_fim_vigencia_contrato: string,
  descricao_objeto_contrato: string,
  valor_total_contrato: number
}

export type ContratoQueryParams = {
  codigo_municipio: string;
  data_contrato: string;
  quantidade: number;
  deslocamento: number;
  numero_contrato?: string;
  tipo_contrato?: string;
  modalidade_contrato?: string;
}

export type Contratados = {
  codigo_municipio: string;
  data_contrato: string;
  numero_contrato: string;
  numero_documento_negociante: string;
  codigo_tipo_negociante: string;
  nome_negociante: string;
  endereco_negociante: string;
  fone_negociante: string;
  cep_negociante: string;
  nome_municipio_negociante: string;
  codigo_uf: string;
}

export type ContratadosQueryParams = {
  codigo_municipio: string;
  quantidade: number;
  deslocamento: number;
  data_contrato: string;
  numero_contrato?: string;
  numero_documento_negociante?: string;
  nome_negociante?: string;
}

export type ItensNotasFiscais = {
  codigo_municipio: string,
  exercicio_orcamento: number,
  codigo_orgao: string,
  codigo_unidade: string,
  data_emissao: string,
  numero_nota_empenho: string,
  data_liquidacao: string,
  tipo_nota_fiscal: string,
  numero_nota_fiscal: string,
  numero_item_sequencial: string,
  descricao1_item: string,
  descricao2_item: string,
  unidade_compra: string,
  numero_quantidade_comprada: number,
  valor_unitario_item: number,
  valor_total_item: number,
  codigo_ncm: string
}

export type ItensNotasFiscaisQueryParams = {
  codigo_municipio: string;
  exercicio_orcamento: number;
  quantidade: number;
  deslocamento: number;
  codigo_orgao?: string;
  codigo_unidade?: string;
  data_emissao?: string;
  numero_nota_empenho?: string;
  data_liquidacao?: string;
  tipo_nota_fiscal?: string;
  numero_nota_fiscal?: string;
}

export type NotasEmpenhos = {
  codigo_municipio: string,
  exercicio_orcamento: number,
  codigo_orgao: string,
  codigo_unidade: string,
  data_emissao_empenho: string,
  numero_empenho: string,
  data_referencia_empenho: number,
  codigo_funcao: string,
  codigo_subfuncao: string,
  codigo_programa: string,
  codigo_projeto_atividade: string,
  numero_projeto_atividade: string,
  numero_subprojeto_atividade: string,
  codigo_elemento_despesa: string,
  modalidade_empenho: string,
  descricao_empenho: string,
  valor_anterior_saldo_dotacao: string,
  valor_empenhado: string,
  valor_atual_saldo_dotacao: string,
  tipo_processo_licitatorio: string,
  numero_documento_negociante: string,
  estado_empenho: string,
  numero_nota_anulacao: string,
  data_emissao_empenho_substituto: string,
  numero_empenho_substituto: string,
  cd_cpf_gestor: string,
  cpf_gestor_contrato: string,
  codigo_tipo_negociante: string,
  nome_negociante: string,
  endereco_negociante: string,
  fone_negociante: string,
  cep_negociante: string,
  nome_municipio_negociante: string,
  codigo_uf: string,
  tipo_fonte: string,
  codigo_fonte: string,
  dadosEmpenho: {
    numero_empenho: string,
    codigo_municipio: string,
    exercicio_orcamento: number,
    codigo_orgao: string,
    codigo_unidade: string,
    data_emissao_empenho: string,
    cd_cpf_gestor: string,
    data_contrato: string,
    codigo_contrato: string,
    data_realizacao_licitacao: string,
    numero_licitacao: string,
    nota_empenho: string
  },
  codigo_contrato: string,
  data_contrato: string,
  numero_licitacao: string
}

export type NotasEmpenhosQueryParams = {
  codigo_municipio: string;
  data_referencia_empenho: number;
  codigo_orgao: string;
  quantidade: number;
  deslocamento: number;
  exercicio_orcamento?: number;
  codigo_unidade?: string;
  data_emissao_empenho?: string;
  numero_empenho?: string;
  numero_documento_negociante?: string;
  numero_licitacao?: number;
  codigo_tipo_negociante?: string;
  nome_negociante?: string;
  nome_municipio_negociante?: string;
  codigo_uf?: string;
}