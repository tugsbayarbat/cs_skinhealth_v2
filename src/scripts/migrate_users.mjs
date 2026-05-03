import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function run() {
  console.log("Starting Admin Migration...");
  
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'`;
  console.log("Successfully attached 'role' column.");
  
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`;
  console.log("Successfully attached 'password_hash' column.");
  
  const hash = await bcrypt.hash('admin123', 10);
  
  try {
    await sql`INSERT INTO users (email, role, password_hash, email_verified) VALUES ('admin@skinhealth.com', 'admin', ${hash}, NOW())`;
    console.log("Successfully seeded default Admin: admin@skinhealth.com / admin123");
  } catch (e) {
    await sql`UPDATE users SET role = 'admin', password_hash = ${hash} WHERE email = 'admin@skinhealth.com'`;
    console.log("Admin payload updated safely.");
  }
  
  console.log("Migration Complete! Safe to Exit.");
}

run();
