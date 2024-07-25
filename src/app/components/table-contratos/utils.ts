import { Contratados, Contrato } from '../../services/tce.types';

export type ContratoDetalhado = Pick<
  Contrato,
  | 'data_contrato'
  | 'data_contrato_original'
  | 'data_fim_vigencia_contrato'
  | 'data_inicio_vigencia_contrato'
  | 'descricao_objeto_contrato'
  | 'modalidade_contrato'
  | 'numero_contrato'
  | 'numero_contrato_original'
  | 'tipo_contrato'
  | 'valor_total_contrato'
> &
  Pick<
    Contratados,
    | 'cep_negociante'
    | 'codigo_tipo_negociante'
    | 'codigo_uf'
    | 'endereco_negociante'
    | 'fone_negociante'
    | 'nome_municipio_negociante'
    | 'nome_negociante'
    | 'numero_documento_negociante'
  >;

export function generateContratoDetalhado(
  contrato: Contrato[],
  contratados: Contratados[]
): ContratoDetalhado[] {
  return contrato.map((c) => {
    const contratado = contratados.find(
      (ct) => ct.numero_contrato === c.numero_contrato
    );
    return {
      cep_negociante: contratado?.cep_negociante || '',
      codigo_tipo_negociante: contratado?.codigo_tipo_negociante || '',
      codigo_uf: contratado?.codigo_uf || '',
      data_contrato: c.data_contrato,
      data_contrato_original: c.data_contrato_original,
      data_fim_vigencia_contrato: c.data_fim_vigencia_contrato,
      data_inicio_vigencia_contrato: c.data_inicio_vigencia_contrato,
      descricao_objeto_contrato: c.descricao_objeto_contrato,
      endereco_negociante: contratado?.endereco_negociante || '',
      fone_negociante: contratado?.fone_negociante || '',
      modalidade_contrato: c.modalidade_contrato,
      nome_municipio_negociante: contratado?.nome_municipio_negociante || '',
      nome_negociante: contratado?.nome_negociante || '',
      numero_contrato: c.numero_contrato,
      numero_contrato_original: c.numero_contrato_original,
      numero_documento_negociante:
        contratado?.numero_documento_negociante || '',
      tipo_contrato: c.tipo_contrato,
      valor_total_contrato: c.valor_total_contrato
    };
  });
}

export const INITIAL_HEADS_ORDER: Array<keyof ContratoDetalhado> = [
  'numero_contrato',
  'numero_contrato_original',
  'data_contrato',
  'data_contrato_original',
  'data_fim_vigencia_contrato',
  'data_inicio_vigencia_contrato',
  'descricao_objeto_contrato',
  'tipo_contrato',
  'modalidade_contrato',
  'valor_total_contrato',
  'numero_documento_negociante',
  'nome_negociante',
  'codigo_tipo_negociante',
  'cep_negociante',
  'endereco_negociante',
  'nome_municipio_negociante',
  'codigo_uf',
  'fone_negociante'
];
