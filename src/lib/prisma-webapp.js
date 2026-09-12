import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma-webapp/client';

const connectionString = process.env.WEBAPP_DATABASE_URL;

let prismaWebapp;

if (connectionString) {
  const isSocket = connectionString.includes('host=/cloudsql/');

  const poolConfig = { 
    connectionString,
    max: 5, // Limit connection pool size per worker
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  };

  // Only apply SSL for TCP connections, do not use TLS for Unix domain sockets
  if (!isSocket) {
    poolConfig.ssl = { rejectUnauthorized: false };
  }

  const pool = new Pool(poolConfig);

  // Handle unexpected pool errors
  pool.on('error', (err) => {
    console.error('Idle WebApp PG client connection error:', err?.message || err);
  });

  const adapter = new PrismaPg(pool);
  prismaWebapp = new PrismaClient({ adapter });
} else {
  // Use a recursive callable Proxy fallback to prevent constructor initialization crashes
  // and runtime unhandled exceptions when WEBAPP_DATABASE_URL is missing
  function createSafeFallback() {
    return new Proxy(() => Promise.resolve([]), {
      get(target, prop) {
        if (prop === 'then') return undefined;
        return createSafeFallback();
      },
      apply(target, thisArg, argArray) {
        return Promise.resolve([]);
      }
    });
  }
  prismaWebapp = createSafeFallback();
}

export default prismaWebapp;
