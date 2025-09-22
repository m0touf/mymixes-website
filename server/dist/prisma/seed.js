"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seed() {
    // Seed any initial data here if needed
    console.log("Seeding completed - no user data to seed");
}
seed().then(() => prisma.$disconnect());
