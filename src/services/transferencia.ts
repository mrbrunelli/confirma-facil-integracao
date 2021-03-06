import db from "../database/connection";
import { logger } from "../helpers/log";
import { serializeNotaTransferencia } from '../helpers/serializer';
import { NotaTransferenciaResponseType, NotaTransferenciaType } from '../types/transferencia';

export const getNotasTransferencia = async (): Promise<NotaTransferenciaResponseType[]> => {
  try {
    logger("Buscando Notas de TransferĂȘncia.");
    const response = await db.query<NotaTransferenciaType>(SQL_TRANSFERENCIA);
    if (response.rowCount == 0) {
      throw Error("Nenhuma Nota de TransferĂȘncia encontrada.");
    }
    const serializedData = serializeNotaTransferencia(response.rows);
    return serializedData;
  } catch (e) {
    throw Error(e.message);
  }
}

const SQL_TRANSFERENCIA = `
select DISTINCT pf.cnpj_cpf as embarcador,
       f.numerofilial || ' - ' || f.fantasia as filial,
       n.numeronota,
       n.serie,
       coalesce(to_char(n.dataemissao, 'dd/mm/yyyy'), '') as dataemissao,
       coalesce(to_char(fn.data, 'dd/mm/yyyy'), '') as dataembarque,
       case
         when (upper(gt.descricao) ilike '%CORREIO%' or upper(gt.descricao) ilike '%RETIRA%') then coalesce(to_char(coalesce(fn.data, n.dataemissao),
           'dd/mm/yyyy'), '')
         else ''
       end as previsaoentrega,
       p.cnpj_cpf::text as cliente_cnpj,
       p.nome as cliente_nome,
       case
         when coalesce(trns.cnpj_cpf, n.idmotorista::text) = '80995241953' then '02937125000178'
         when coalesce(trns.cnpj_cpf, n.idmotorista::text) = '1086' then '77941490000155'
         else coalesce(trns.cnpj_cpf, n.idmotorista::text)
       end as transportadora_cnpj,
       case
         when m.nome = 'CLAUDINEI PEREIRA MACIEL' then 'TRANS HERRERO'
         when coalesce(trns.cnpj_cpf, n.idmotorista::text) = '1086' then 'GAZIN MATRIZ - FILIAL 01'
         when coalesce(trns.cnpj_cpf, n.idmotorista::text) = '77941490015349' then 'GAZIN ATACADO BA - FILIAL 146'
         when coalesce(trns.cnpj_cpf, n.idmotorista::text) = '77941490025301' then 'GAZIN E-COMMERCE BA - FILIAL 251'
         when coalesce(trns.cnpj_cpf, n.idmotorista::text) = '22962737000128' then 'GAZIN GO - FILIAL 1'
         when coalesce(trns.cnpj_cpf, n.idmotorista::text) = '77941490000155' then 'GAZIN MATRIZ - FILIAL 01'
         when coalesce(trns.cnpj_cpf, n.idmotorista::text) = '77941490027002' then 'GAZIN MS - FILIAL 269'
         when coalesce(trns.cnpj_cpf, n.idmotorista::text) = '77941490026626' then 'GAZIN MS INTERNO - FILIAL 265'
         when coalesce(trns.cnpj_cpf, n.idmotorista::text) = '77941490019506' then 'GAZIN PB - FILIAL 176'
         when coalesce(trns.cnpj_cpf, n.idmotorista::text) = '77941490022558' then 'GAZIN PR - FILIAL 222'
         when coalesce(trns.cnpj_cpf, n.idmotorista::text) = '77941490007753' then 'GAZIN PR - FILIAL 68'
         else coalesce(trsp.descricao, m.nome, '')
       end as transportadora_nome,
       eb.cidade,
       c.uf,
       n.idnfesefaz,
       case
         when coalesce(trns.cnpj_cpf, n.idmotorista::text) = '33054595000117' then 'Terceiros'
         when coalesce(trns.cnpj_cpf, n.idmotorista::text) = '32656650000186' then 'Terceiros'
         else coalesce(replace (coalesce(tp2.descricao, gt.descricao), 'PrĂłprio', 'Proprio'), 'Sem informacao')
       end as tipoentrega,
       coalesce(fn.idromaneio::text, '') as idromaneio,
       coalesce(fn.placa, plc.placa, '') as placa,
       lower(translate(coalesce(moto.nome, fn.motorista, ''),
         'ĂĄĂ ĂąĂŁĂ€Ă„aaaĂĂĂĂĂAAAĂĂ©ĂšĂȘĂ«eeeeeEEEĂEEĂĂŹĂ­ĂźĂŻĂŹiiiĂĂĂĂĂIIIĂłĂŽĂ”Ă¶oooĂČĂĂĂĂĂOOOĂčĂșĂ»ĂŒuuuuĂĂĂĂUUUUĂ§ĂĂ±ĂĂœĂ',
         'aaaaaaaaaAAAAAAAAAeeeeeeeeeEEEEEEEiiiiiiiiIIIIIIIIooooooooOOOOOOOOuuuuuuuuUUUUUUUUcCnNyY')) as motorista_nome,
       case
         when coalesce(px.marketplace, 0) in (1, 2) then 'e-commerce'
         else 'Atacado'
       end::varchar as tipopedido,
       'Varejo'       AS mov_canal
from rst.nota n
     inner join rst.enderecobase eb using (idfilial, idregistronota)
     inner join glb.cidade c on c.idcidade = eb.idcidade
     left join rst.pedidovendanota pvn on pvn.idfilial = n.idfilial and pvn.idregistronota = n.idregistronota
     left join rst.pedidovenda pv on pv.idfilial = pvn.idfilial and pv.idpedidovenda = pvn.idpedidovenda
     left join glb.filial f on f.idfilial = n.idfilial
     left join glb.pessoa p on p.idcnpj_cpf = n.idcnpj_cpf
     left join glb.pessoa pf on pf.idcnpj_cpf = f.idcnpj_cpf
     left join rst.observacaonota obs on obs.idregistronota = n.idregistronota and obs.idfilial = n.idfilial
     left join glb.motorista m on m.idmotorista = n.idmotorista
     left join gazin.gztipoentrega gt on gt.idtipoentrega = m.idtipoentrega and gt.idtipoentrega not in (4,5) /* correios, cliente retira */
     left join glb.entidade ent on ent.identidade = m.identidade
     left join sis.situacaonota sit on sit.idsituacaonota = n.idsituacaonota
     left join gazin.frete_romaneio_nota frn on frn.idfilial = n.idfilial and frn.idregistronota = n.idregistronota
     left join gazin.frete_romaneio fn on fn.idromaneio = coalesce((
                                                                     select max(idromaneio)
                                                                     from gazin.frete_romaneio_nota
                                                                     where idfilial = n.idfilial and
                                                                           idregistronota = n.idregistronota
     ), 0)
     left join glb.motorista moto on moto.idmotorista = fn.idmotorista
     left join gazin.gztipoentrega tp2 on tp2.idtipoentrega = moto.idtipoentrega
     LEFT JOIN GLB.PESSOA TRNS ON TRNS.idcnpj_cpf = ent.idcnpj_cpf
     left join glb.veiculo plc on plc.idveiculo = fn.idveiculo
     left join gazin.frete_transportadora_cgc_agrupador trsp on trsp.idagrupador = fn.idtransportadora
     left join rst.pedidovendaauxiliar px on px.idpedidovenda = pv.idpedidovenda and px.idfilial = pv.idfilial
     left join gazin.confirma_facil_integracao cf on cf.idromaneio = fn.idromaneio and cf.numeronota = n.numeronota
     where (cf.status is null or cf.status = 2) and -- cf.status 2 - PENDENTE
      fn.idromaneio is not null and
      n.idfilial in (10001, 10222, 10294, 10265, 10269, 10307, 10146, 10251, 140001, 10176, 10121, 10283, 10282, 10067, 10115) and
      (trns.nome not ilike '%cliente retira%' and trns.nome not ilike '%correios%') and
      (trsp.descricao not ilike '%cliente retira%' and trsp.descricao not ilike '%correios%') and
      (m.nome not ilike '%cliente retira%' and m.nome not ilike '%correios%') and
      fn.data >= (case
                           when current_time between '05:00:00'::time and '20:10:00'::time then current_date
                           else current_date - 5
                         end) and
      n.idsituacaonotasefaz = 2 and
      n.idprocessomestre in (
                              SELECT idprocesso
                              FROM glb.processo
                              where descricao ilike '%transf%' and
                                    idsituacaoprocesso = 1
      );
`;