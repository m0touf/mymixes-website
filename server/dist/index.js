"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/index.ts
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const PORT = Number(process.env.PORT) || 4000;
const server = (0, http_1.createServer)(app_1.default);
server.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ API listening on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check available at: http://0.0.0.0:${PORT}/health`);
    console.log(`📊 Process ID: ${process.pid}`);
    console.log(`🔧 Node version: ${process.version}`);
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
