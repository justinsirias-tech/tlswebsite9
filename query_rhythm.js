const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rhythm = await prisma.location.findFirst({
    where: { name: { contains: "Rhythm" } }
  });
  console.log("Rhythm Asoke data:", rhythm);
}

main().catch(console.error).finally(() => prisma.$disconnect());
