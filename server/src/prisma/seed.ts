const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()

async function seed() {
    // Seed any initial data here if needed
    console.log("Seeding completed - no user data to seed");
}

seed().then(() => prisma.$disconnect());