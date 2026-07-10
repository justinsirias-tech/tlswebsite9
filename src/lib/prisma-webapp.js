import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma-webapp/client';

const connectionString = process.env.WEBAPP_DATABASE_URL;

let prismaWebapp;

if (connectionString) {
  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 2 // Limit connection pool size per worker
  });
  const adapter = new PrismaPg(pool);
  prismaWebapp = new PrismaClient({ adapter });
} else {
  // Fallback to prevent startup crash if environment variable is not defined
  prismaWebapp = new PrismaClient();
}

export default prismaWebapp;
