import "dotenv/config";
import { StatusIntegracao } from "../helpers/status";
import { getToken, insertOrUpdateStatus, send } from "../services/confirma-facil";
import { getNotasVenda } from "../services/venda";

const vendaController = async () => {
  try {
    const email = process.env.CF_EMAIL;
    const senha = process.env.CF_PASS;
    if (!email || !senha) {
      throw Error("Erro ao importar E-mail e Senha do Confirma Fácil");
    }
    const notas = await getNotasVenda();
    for (let i = 0; i < notas.length; i++) {
      const token = await getToken(email, senha);
      const response = await send(notas[i], token);
      const { numero, romaneio } = notas[i].embarque;
      const status = response.statusCode == 200 ? StatusIntegracao.ENVIADA : StatusIntegracao.PENDENTE;
      await insertOrUpdateStatus(Number(numero), Number(romaneio), status);
    }
  } catch (e) {
    throw Error(e.message);
  }
}


