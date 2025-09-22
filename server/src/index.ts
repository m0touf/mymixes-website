// server/src/index.ts
import { createServer } from "http";
import app from "./app";

const PORT = Number(process.env.PORT) || 4000;

const server = createServer(app);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ API listening on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check available at: http://0.0.0.0:${PORT}/health`);
  console.log(`📊 Process ID: ${process.pid}`);
  console.log(`🔧 Node version: ${process.version}`);
  console.log(`🗄️ DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
  console.log(`🔑 JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'NOT SET'}`);
  console.log(`👤 ADMIN_PASSWORD_HASH: ${process.env.ADMIN_PASSWORD_HASH ? 'SET' : 'NOT SET'}`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
