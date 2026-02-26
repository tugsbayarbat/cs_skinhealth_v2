import { neon } from '@neondatabase/serverless';

// Singleton Neon SQL client — reused across API routes
const sql = neon(process.env.DATABASE_URL);

export default sql;
