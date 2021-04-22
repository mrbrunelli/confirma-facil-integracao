import "dotenv/config";
import db from "../database/connection";
import { StatusIntegracao } from '../helpers/status';
import api from './api';

type LoginType = {
  resposta: {
    token: string
  }
}

export const getToken = async (email: string, senha: string): Promise<string> => {
  const loginBody = { email, senha };
  try {
    const response = await api.post<LoginType>('/login/login', loginBody);
    const { resposta } = response.data;
    const token = resposta.token;
    if (!token) {
      throw Error("Login não retornou Token.");
    }
    return token;
  } catch (e) {
    throw Error(e.message);
  }
}

type SendType = {
  message: {
    message: string
  }[]
}

type SendResponseType = {
  statusCode: number
  message: string
}

export const send = async (nota: object, token: string): Promise<SendResponseType> => {
  try {
    const response = await api.post<SendType>('/business/v2/embarque', [nota], {
      headers: { Authorization: token }
    })
    const { data, status } = response;
    return {
      statusCode: status,
      message: data.message[0].message
    }
  } catch (e) {
    throw Error(e.message);
  }
}

/**
 * @param nota - Número da Nota
 * @param romaneio - ID do Romaneio
 * @param status - Status da Integração. Informa se a nota/romaneio foi enviada para o Confirma Fácil: 1 - ENVIADA, 2 - PENDENTE
 */
export const insertOrUpdateStatus = async (nota: number, romaneio: number, status: StatusIntegracao) => {
  try {
    const response = await db.query(`
      SELECT 1 
      FROM gazin.confirma_facil_integracao
      WHERE numeronota = ${nota} 
      AND idromaneio = ${romaneio}
    `);
    if (response.rowCount == 0) {
      await db.query(`
        INSERT INTO gazin.confirma_facil_integracao (numeronota, idromaneio, status)
        VALUES (${nota}, ${romaneio}, ${status})
      `);
      return "Nota Inserida com Sucesso!";
    } else {
      await db.query(`
        UPDATE gazin.confirma_facil_integracao
        SET status = ${status}
        WHERE numeronota = ${nota}
        AND idromaneio = ${romaneio}
      `);
      return "Nota Atualizada com Sucesso!";
    }
  } catch (e) {
    throw Error(e.message);
  }
}
