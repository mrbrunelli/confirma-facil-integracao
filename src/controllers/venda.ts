import "dotenv/config";
import { logger } from "../helpers/log";
import { StatusIntegracao } from "../helpers/status";
import { getToken, insertOrUpdateStatus, send } from "../services/confirma-facil";
import { getNotasVenda } from "../services/venda";

export const vendaController = async () => {
  try {
    const email = process.env.CF_EMAIL;
    const senha = process.env.CF_PASS;
    if (!email || !senha) {
      throw Error("Erro ao importar E-mail e Senha do Confirma Fácil");
    }
    const notas = await getNotasVenda();
    const token = await getToken(email, senha);
    logger(notas.length + " Notas de Venda.")
    for (let i = 0; i < notas.length; i++) {
      const response = await send(notas[i], token);
      const { numero, romaneio } = notas[i].embarque;
      const status = response.statusCode == 200 ? StatusIntegracao.ENVIADA : StatusIntegracao.PENDENTE;
      const message = await insertOrUpdateStatus(Number(numero), Number(romaneio), status);
      logger(`${i} - ${response.message} | ${message}`);
    }
    logger("Notas de Venda Enviadas.")
  } catch (e) {
    throw Error(e.message);
  }
}


