import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

import * as schema from './schema.js';

// Setup connection pool
const pool = new Pool({
  host: process.env.SQL_HOST || '127.0.0.1',
  port: parseInt(process.env.SQL_PORT || '5432'),
  user: process.env.SQL_USER || 'postgres',
  password: process.env.SQL_PASSWORD || 'postgres',
  database: process.env.SQL_DB_NAME || 'postgres',
});

export const db = drizzle(pool, { schema });
