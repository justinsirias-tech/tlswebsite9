const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'justin@thatlaundryshop.com';
  const newPassword = '553787';
  const hash = await bcrypt.hash(newPassword, 10);
  
  const updated = await prisma.adminUser.update({
    where: { email },
    data: { passwordHash: hash }
  });
  
  console.log(`Successfully updated password for ${email} in database to "${newPassword}". Hash: ${hash}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
