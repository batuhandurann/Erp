import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

export function getPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDemo = process.env.DEMO_MODE === 'true';
  const databaseUrl = process.env.DATABASE_URL;

  // Strict production requirement: zero silent fallback in production
  if (isProduction && !databaseUrl) {
    const errorMsg = 'DATABASE_CONNECTION_FAILED: DATABASE_URL is missing. Production mode requires a valid PostgreSQL connection.';
    console.error('❌ FATAL:', errorMsg);
    throw new Error(errorMsg);
  }

  if (isProduction && isDemo) {
    throw new Error('CONFIG_VIOLATION: DEMO_MODE is forbidden in production (NODE_ENV=production).');
  }

  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl || 'postgresql://postgres:postgres@localhost:5432/businessflow_db?schema=public'
        }
      },
      log: ['error', 'warn']
    });
  }

  return global.__prisma;
}

// Proxy export for lazy evaluation so module loading does not crash prior to runtime access
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const client = getPrismaClient();
    const val = Reflect.get(client, prop, receiver);
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  }
});
