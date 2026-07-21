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
  // Use a Proxy fallback to prevent constructor initialization crashes during next build (when WEBAPP_DATABASE_URL is missing)
  prismaWebapp = new Proxy({}, {
    get(target, prop) {
      if (prop === 'then') return undefined;
      return new Proxy(() => {}, {
        apply() {
          throw new Error("prismaWebapp cannot be used because WEBAPP_DATABASE_URL is not configured in environment variables.");
        },
        get(t, p) {
          if (p === 'then') return undefined;
          return this; // Return itself recursively to support chaining like prismaWebapp.member.findMany
        }
      });
    }
  });
}

export default prismaWebapp;
