import "dotenv/config";
import app, { initialize } from "./app.js";

const port = process.env.PORT ?? 8080;

app.listen(port, async () => {
  console.log(`Redis JS starter server listening on port ${port}`);

  await initialize();
});
