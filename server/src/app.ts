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
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ], 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Simple test endpoint
app.get("/", (_req, res) => {
  res.json({ message: "Server is running!" });
});

// Health check endpoint
app.get("/health", (_req, res) => {
  console.log('Health check requested');
  res.status(200).json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount all feature routers
app.use("/", api);
app.use(errorHandler);

export default app;
