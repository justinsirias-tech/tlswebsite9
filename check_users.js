const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.adminUser.findMany();
  console.log("Users in DB:", users);
  
  if (users.length > 0) {
      for (const user of users) {
          const valid = await bcrypt.compare("tls@2026", user.passwordHash);
          console.log(`Password 'tls@2026' valid for ${user.email}?`, valid);
      }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
