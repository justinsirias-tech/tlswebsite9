import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/webapp-client';

const connectionString = `${process.env.WEBAPP_DATABASE_URL}`;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 2 // Limit connection pool size per worker
});
const adapter = new PrismaPg(pool);
const prismaWebapp = new PrismaClient({ adapter });

export default prismaWebapp;
