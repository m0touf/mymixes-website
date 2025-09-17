import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

app.get("/users", async(_, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});