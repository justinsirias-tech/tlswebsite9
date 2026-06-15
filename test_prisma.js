const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const data = {
    name: "Rhythm Asoke",
    city: "Bangkok",
    type: "condo",
    stars: 5,
    totalRooms: 385,
    averagePrice: "฿25,000 / month",
    address: "299 Thanon Asok - Din Daeng, Khwaeng Makkasan, Khet Ratchath",
    transport: "MRT Phra Ram 9, Airport Rail Link Makkasan",
    nearbyAmenities: ["Central Rama 9", "Fortune Town"],
    slug: "rhythm-asoke"
  };
  
  try {
    await prisma.location.create({ data });
    console.log("Success!");
  } catch (err) {
    console.error("Prisma error:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
