const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const initialKeywords = [
  "How to properly care for and wash luxury silk garments",
  "The ultimate guide to dry cleaning wedding dresses and suits in Bangkok",
  "Why professional wet cleaning is better than traditional washing for delicate clothes",
  "Garment care tips: How to prevent wool sweaters from shrinking",
  "Pattaya's best laundry pick-up and delivery services: A comparison",
  "How often should you clean bedsheets and comforters for optimal hygiene",
  "Stain removal 101: How to get red wine and coffee stains out of white shirts",
  "The benefits of eco-friendly laundry detergents on sensitive skin"
];

async function main() {
  console.log("=== Checking Current Keyword Queue ===");
  const allKeywords = await prisma.keywordQueue.findMany();
  console.log(`Total keywords in database: ${allKeywords.length}`);
  
  console.log("Seeding missing keywords...");
  let addedCount = 0;
  for (const kw of initialKeywords) {
    const exists = allKeywords.some(k => k.keyword === kw);
    if (!exists) {
      try {
        await prisma.keywordQueue.create({
          data: {
            keyword: kw,
            status: "PENDING"
          }
        });
        console.log(`- Added: "${kw}"`);
        addedCount++;
      } catch (err) {
        console.error(`Error adding "${kw}":`, err.message);
      }
    }
  }
  
  console.log(`Successfully added ${addedCount} new keywords to the queue.`);
  
  const pending = await prisma.keywordQueue.findMany({
    where: { status: "PENDING" }
  });
  console.log(`\nThere are now ${pending.length} pending keywords in the queue.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
