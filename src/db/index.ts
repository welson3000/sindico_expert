import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@ep-placeholder.aws.neon.tech/sindico_expert?sslmode=require';
const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
