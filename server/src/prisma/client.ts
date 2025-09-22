// src/prisma/client.ts
import { PrismaClient } from "@prisma/client";

let prismaInstance: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  return prismaInstance;
}

// For backward compatibility
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    return getPrismaClient()[prop as keyof PrismaClient];
  }
});
