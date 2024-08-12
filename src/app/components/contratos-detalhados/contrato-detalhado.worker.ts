import { GenerateContratoDetalhadoParams } from './contratos-detalhados.store';

onmessage = (event: MessageEvent<GenerateContratoDetalhadoParams>) => {
  const { contratos, contratados } = event.data;

  const result = contratos.map((c) => {
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

  postMessage(result);
};