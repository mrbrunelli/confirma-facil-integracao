import "dotenv/config";
import { logger } from "../helpers/log";
import { getNotasCanceladas } from "../services/cancelada";
import { getToken, send } from "../services/confirma-facil";
import { NotaCanceladaResponseType } from "../types/cancelada";

export const canceladaController = async () => {
  try {
    const email = process.env.CF_EMAIL;
    const senha = process.env.CF_PASS;
    if (!email || !senha) {
      throw Error("Erro ao importar E-mail e Senha do Confirma Fácil");
    }
    const notas = await getNotasCanceladas();
    const token = await getToken(email, senha);
    await exec(notas, token);
  } catch (e) {
    logger(e.message);
  }
}

const exec = async (notas: NotaCanceladaResponseType[], token: string) => {
  logger(notas.length + " Notas Canceladas.");
  for (let i = 0; i < notas.length; i++) {
    const response = await send(notas[i], token);
    logger(`${i} - ${response.message}`);
  }
  logger("Notas Canceladas Enviadas.");
}
