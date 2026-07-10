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
