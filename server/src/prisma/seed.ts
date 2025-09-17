import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

async function seed() {
    await prisma.user.createMany({
        data: [
            {
                email: "test@test.com",
                name: "Test User",
                imageUrl: "https://via.placeholder.com/150",
            }
        ]
    })
}

seed().then(() => prisma.$disconnect());