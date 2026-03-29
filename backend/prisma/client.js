import { PrismaClient } from "@prisma/client";
import "dotenv/config";

// We create a single instance of PrismaClient here.
// In Prisma 7, we pass the URL directly into the constructor.
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
