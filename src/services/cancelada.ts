import db from "../database/connection";
import { logger } from "../helpers/log";
import { serializeNotaCancelada } from '../helpers/serializer';
import { NotaCanceladaResponseType, NotaCanceladaType } from '../types/cancelada';

export const getNotasCanceladas = async (): Promise<NotaCanceladaResponseType[]> => {
  try {
    logger("Buscando Notas Canceladas.");
    const response = await db.query<NotaCanceladaType>(SQL_CANCELADAS);
    if (response.rowCount == 0) {
      throw Error("Nenhuma Nota Cancelada encontrada.");
    }
    const serializedData = serializeNotaCancelada(response.rows);
    return serializedData;
  } catch (e) {
    throw Error(e.message);
  }
}

const SQL_CANCELADAS = `
select 
  n.numeronota,
  n.serie,
  pf.cnpj_cpf as embarcador
  from rst.nota n
  inner join rst.enderecobase eb using (idfilial, idregistronota)
  inner join glb.cidade c on c.idcidade = eb.idcidade
  left join rst.pedidovendanota pvn on pvn.idfilial = n.idfilial and pvn.idregistronota = n.idregistronota
  left join rst.pedidovenda pv on pv.idfilial = pvn.idfilial and pv.idpedidovenda = pvn.idpedidovenda
  left join glb.filial f on f.idfilial = n.idfilial
  left join glb.pessoa p on p.idcnpj_cpf = n.idcnpj_cpf
  left join glb.pessoa pf on pf.idcnpj_cpf = f.idcnpj_cpf
  where n.idfilial in (10001, 10222, 10294, 10265, 10269, 10307, 10146, 10251, 140001, 10176, 10121, 10283, 10282, 10067, 10115) and
  n.datamovimento >= current_date - 5 and
  n.idsituacaonota in (2, 4) and
  pv.idvendedor not in (3116, 18316) and
  n.idmotorista not in (1242, 2301, 1021, 4584, 4088, 3415, 4583) and
  pf.cnpj_cpf <> '77941490000589' and
  (n.idprocessomestre = 9507 or
  n.idprocessomestre in (
                        SELECT p.idprocesso
                        FROM glb.processo p
                        where p.idprocesso <> 9630 and
                              p.idoperacao in (902010, 502010, /* bonficações-> */
                              901017, 501010, 502010, 902030, 202020, 102020, 201020, 101025, 101020, 901015, 601010, 602015, 602090, 502090,
                                902045) and
                              p.idsituacaoprocesso = 1
  ));
`;