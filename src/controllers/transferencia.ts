import "dotenv/config";
import { logger } from "../helpers/log";
import { StatusIntegracao } from "../helpers/status";
import { getToken, insertOrUpdateStatus, send } from "../services/confirma-facil";
import { getNotasTransferencia } from "../services/transferencia";
import { NotaTransferenciaResponseType } from "../types/transferencia";

export const transferenciaController = async () => {
  try {
    const email = process.env.CF_EMAIL;
    const senha = process.env.CF_PASS;
    if (!email || !senha) {
      throw Error("Erro ao importar E-mail e Senha do Confirma Fácil");
    }
    const notas = await getNotasTransferencia();
    const token = await getToken(email, senha);
    await exec(notas, token);
  } catch (e) {
    logger(e.message);
  }
}

const exec = async (notas: NotaTransferenciaResponseType[], token: string) => {
  logger(notas.length + " Notas de Transferência.");
  for (let i = 0; i < notas.length; i++) {
    const response = await send(notas[i], token);
    const { numero, romaneio } = notas[i].embarque;
    const status = response.statusCode == 200 ? StatusIntegracao.ENVIADA : StatusIntegracao.PENDENTE;
    const message = await insertOrUpdateStatus(Number(numero), Number(romaneio), status);
    logger(`${i} - ${response.message} | ${message}`);
  }
  logger("Notas de Transferência Enviadas.");
}
