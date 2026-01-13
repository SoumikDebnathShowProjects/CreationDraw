import { PrismaClient } from '../src/generated/prisma/client' // Import from node_modules, not ./generated
import { PrismaNeon } from '@prisma/adapter-neon'
import dotenv from 'dotenv'

dotenv.config();

const connectionString = process.env.DATABASE_URL || "";
const adapter = new PrismaNeon({ connectionString })

export const prismaClient = new PrismaClient({ adapter });