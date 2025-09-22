"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.getPrismaClient = getPrismaClient;
// src/prisma/client.ts
const client_1 = require("@prisma/client");
let prismaInstance;
function getPrismaClient() {
    if (!prismaInstance) {
        prismaInstance = new client_1.PrismaClient({
            log: ['error', 'warn'],
        });
    }
    return prismaInstance;
}
// For backward compatibility
exports.prisma = new Proxy({}, {
    get(target, prop) {
        return getPrismaClient()[prop];
    }
});
