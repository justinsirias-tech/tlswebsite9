const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const locations = await prisma.location.findMany();
  console.log(`Found ${locations.length} locations`);
  if (locations.length > 0) {
    console.log(locations[0]);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
