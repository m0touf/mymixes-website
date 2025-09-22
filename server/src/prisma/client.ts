// src/prisma/client.ts
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  return prisma;
}

// For backward compatibility
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    return getPrismaClient()[prop as keyof PrismaClient];
  }
});
