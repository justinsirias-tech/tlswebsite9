import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
  const isSocket = connectionString.includes('host=/cloudsql/');

  const poolConfig = { 
    connectionString,
    max: 10,
    idleTimeoutMillis: 10000, // Close idle connections after 10s to prevent stale/dead sockets
    connectionTimeoutMillis: 10000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 5000,
  };

  // Only apply SSL for TCP connections, do not use TLS for Unix domain sockets
  if (!isSocket) {
    poolConfig.ssl = { rejectUnauthorized: false };
  }

  const pool = new Pool(poolConfig);

  // Handle unexpected idle client errors in pool to prevent unhandled socket crashes
  pool.on('error', (err) => {
    console.error('Idle PG client connection error:', err?.message || err);
  });

  const adapter = new PrismaPg(pool);
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma;

export default prisma;
