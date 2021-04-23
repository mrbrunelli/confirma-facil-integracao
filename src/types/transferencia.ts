export type NotaTransferenciaType = {
  embarcador: string
  filial: string
  numeronota: number
  serie: string
  dataemissao: string
  dataembarque: string
  previsaoentrega: string
  cliente_cnpj: string
  cliente_nome: string
  transportadora_cnpj: string
  idmotorista: number
  transportadora_nome: string
  cidade: string
  uf: string
  idpedidovenda: number
  inclusaopedido: string
  idnfesefaz: string
  tipoentrega: string
  idromaneio: string
  placa: string
  motorista_nome: string
  tipopedido: string
  mov_canal: string
}

export type NotaTransferenciaResponseType = {
  embarque: {
    romaneio: string,
    numero: string,
    serie: string,
    chave: string,
    dtEmissao: string,
    dtEmbarque: string
  },
  embarcador: {
    nome: string,
    cnpj: string
  },
  destinatario: {
    nome: string,
    cnpj: string,
    endereco: {
      uf: string,
      cidade: string
    }
  },
  transportadora: {
    cnpj: string
  },
  tags: string[]
}
