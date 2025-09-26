import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let poolInstance: Pool | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbInstance: any;

if (process.env.DATABASE_URL) {
  poolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
  dbInstance = drizzle({ client: poolInstance, schema });
} else {
  dbInstance = new Proxy({}, {
    get() {
      throw new Error("DATABASE_URL not configured; database access is unavailable.");
    }
  });
}

export const pool = poolInstance;
export const db = dbInstance;