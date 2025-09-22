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
  origin: [
    "http://localhost:5173", // Vite dev server
    "https://*.vercel.app", // Vercel preview deployments
    process.env.FRONTEND_URL // Production frontend URL
  ].filter(Boolean), 
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
