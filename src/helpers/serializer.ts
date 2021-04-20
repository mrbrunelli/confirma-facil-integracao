import { NotaVendaResponseType, NotaVendaType } from "../types/venda";

export const serializeNotaVenda = (notas: NotaVendaType[]): NotaVendaResponseType[] => {
  return notas.map(n => ({
    embarque: {
      romaneio: n.idromaneio.toString(),
      numero: n.numeronota.toString(),
      serie: n.serie,
      chave: n.idnfesefaz,
      dtEmissao: n.dataemissao,
      dtEmbarque: n.dataembarque
    },
    embarcador: {
      nome: n.filial,
      cnpj: n.embarcador
    },
    destinatario: {
      nome: n.cliente_nome,
      cnpj: n.cliente_cnpj,
      endereco: {
        uf: n.uf,
        cidade: n.cidade
      }
    },
    transportadora: {
      cnpj: n.transportadora_cnpj
    },
    tags: [
      'tipo entrega: ' + n.tipoentrega,
      'romaneio: ' + n.idromaneio.toString(),
      'placa: ' + n.placa,
      'motorista: ' + n.motorista_nome,
      'tipo pedido: ' + n.tipopedido
    ]
  }))
}
