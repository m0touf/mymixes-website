// server/src/app.ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import api from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(helmet());
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? ["http://localhost", "http://127.0.0.1"] 
    : "http://localhost:5173", 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// Mount all feature routers
app.use("/", api);
app.use(errorHandler);

export default app;
