import "dotenv/config";
import { config } from "./config.js";
import { log } from "./log.js";
import { app, initialize } from "./app.js";

app.listen(config.PORT, async () => {
  log.info(`Redis JS starter server listening on port ${config.PORT}`);

  await initialize();
});
