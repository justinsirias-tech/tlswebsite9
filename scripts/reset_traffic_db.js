require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const prisma = require('../src/lib/prisma').default;

async function main() {
  console.log("Wiping all sample/seed pageview records from database...");

  const deleted = await prisma.pageView.deleteMany({});

  console.log(`Successfully deleted ${deleted.count} sample pageview records!`);
  console.log("PageView database table is now 100% clean and ready for real traffic tracking.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
