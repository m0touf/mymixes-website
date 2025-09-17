// server/src/app.ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { attachUser } from "./middlewares/attachUser";
import api from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(attachUser); // <-- populates req.user if a valid token exists

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/", api);
app.use(errorHandler);

export default app;
