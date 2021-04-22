import { log } from "console";

export const logger = (message: string): void => {
  const date = new Date();
  const day = date.toLocaleDateString("pt-BR");
  const hour = date.toLocaleTimeString("pt-BR");
  log(`${day} ${hour} ${message}`);
}
