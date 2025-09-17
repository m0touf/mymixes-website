// server/src/index.ts
import { createServer } from "http";
import app from "./app";

const PORT = Number(process.env.PORT) || 4000;

createServer(app).listen(PORT, () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
});
