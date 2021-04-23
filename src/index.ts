import { CronJob } from "cron";
import { canceladaController } from "./controllers/cancelada";
import { transferenciaController } from "./controllers/transferencia";
import { vendaController } from "./controllers/venda";

const TIME_ZONE = "America/Sao_Paulo";

new CronJob("0 0 2,6-20/3 * * *", vendaController, null, true, TIME_ZONE)
  .start();

new CronJob("0 0 3,6-20/3 * * *", transferenciaController, null, true, TIME_ZONE)
  .start();

new CronJob("0 0 4 * * *", canceladaController, null, true, TIME_ZONE)
  .start();
