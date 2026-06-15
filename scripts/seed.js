const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Location Data...");
  const hotelsPath = path.join(__dirname, '../src/data/hotels.json');
  if (fs.existsSync(hotelsPath)) {
    const hotelsData = JSON.parse(fs.readFileSync(hotelsPath, 'utf8'));
    for (const h of hotelsData) {
      await prisma.location.upsert({
        where: { slug: h.slug },
        update: {
          name: h.name,
          city: h.city,
          type: h.type,
          stars: h.stars || 5,
          totalRooms: h.totalRooms || 0,
          averagePrice: h.averagePrice || "฿0",
          transport: h.transport || "N/A",
          image: h.image || null,
          mapLink: h.mapLink || null,
          website: h.website || null,
          nearbyAmenities: h.nearbyAmenities || []
        },
        create: {
          slug: h.slug,
          name: h.name,
          city: h.city,
          type: h.type,
          stars: h.stars || 5,
          totalRooms: h.totalRooms || 0,
          averagePrice: h.averagePrice || "฿0",
          transport: h.transport || "N/A",
          image: h.image || null,
          mapLink: h.mapLink || null,
          website: h.website || null,
          nearbyAmenities: h.nearbyAmenities || []
        }
      });
    }
    console.log(`Seeded ${hotelsData.length} locations.`);
  }

  console.log("Seeding Pricing Data...");
  const pricingPath = path.join(__dirname, '../src/data/pricing.json');
  if (fs.existsSync(pricingPath)) {
    const pricingData = JSON.parse(fs.readFileSync(pricingPath, 'utf8'));
    let pricingCount = 0;
    
    // Clear old pricing to prevent duplicates during seed
    await prisma.pricing.deleteMany();

    for (const [category, items] of Object.entries(pricingData)) {
      for (const item of items) {
        await prisma.pricing.create({
          data: {
            category: category,
            name: item.name,
            nonMember: parseFloat(item.nonMember) || 0,
            member: item.member ? parseFloat(item.member) : null,
            unit: item.unit || "piece"
          }
        });
        pricingCount++;
      }
    }
    console.log(`Seeded ${pricingCount} pricing items.`);
  }

  console.log("Seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
