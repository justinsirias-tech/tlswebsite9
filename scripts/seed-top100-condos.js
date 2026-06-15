const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const bangkokCondos = [
  "98 Wireless", "The Ritz-Carlton Residences, Bangkok", "Magnolias Ratchadamri Boulevard",
  "The Residences at Mandarin Oriental, Bangkok", "Banyan Tree Residences Riverside Bangkok",
  "The Monument Thong Lo", "Saladaeng One", "TELA Thonglor", "Ashton Asoke",
  "Ashton Chula-Silom", "Ideo Q Sukhumvit 36", "The Line Jatujak-Mochit",
  "The Room Sukhumvit 38", "Q Sukhumvit", "Sindhorn Residence",
  "185 Rajadamri", "The Sukhothai Residences", "Four Seasons Private Residences Bangkok",
  "Watermark Chao Phraya River", "The River Condominium", "Hyde Heritage Thonglor",
  "Marque Sukhumvit", "Vittorio Sukhumvit 39", "Beatniq Sukhumvit 32",
  "The Estelle Phrom Phong", "Laviq Sukhumvit 57", "Life One Wireless",
  "Life Asoke Hype", "Ideo Mobi Asoke", "Rhythm Ekkamai",
  "Park Origin Thonglor", "KnightsBridge Prime Sathorn", "Supalai Icon Sathorn",
  "Nimit Langsuan", "Scope Langsuan", "The Lofts Silom",
  "Tait Sathorn 12", "Noble State 39", "Noble Ploenchit",
  "Noble Around Ari", "Ideo Q Victory", "The Address Siam-Ratchathewi",
  "Celes Asoke", "KRAAM Sukhumvit 26", "AERIE Sathorn",
  "The Reserve Sathorn", "The Reserve Sukhumvit 61", "The Diplomat 39",
  "The Diplomat Sathorn", "Baan Rajprasong"
];

const pattayaCondos = [
  "Copacabana Beach Jomtien", "The Riviera Wongamat Beach", "The Riviera Jomtien",
  "The Riviera Ocean Drive", "The Riviera Monaco", "Unixx South Pattaya",
  "The Base Central Pattaya", "Edge Central Pattaya", "Grand Solaire Pattaya",
  "Andromeda Condo Pattaya", "Centara Grand Residence Pattaya", "Arom Wongamat",
  "Zire Wongamat", "Northpoint Condominium", "The Cove Pattaya",
  "Arcadia Millennium Tower", "Arcadia Beach Continental", "Arcadia Beach Resort",
  "Seven Seas Condo Resort", "Seven Seas Cote d'Azur", "Dusit Grand Park 2",
  "Dusit Grand Condo View", "Water’s Edge Pattaya", "Reflection Jomtien Beach Pattaya",
  "Cetus Beachfront Pattaya", "Grand Florida Beachfront Condo Resort", "Del Mare Bangsaray Beachfront",
  "Marina Golden Bay Pattaya", "City Garden Tower", "City Garden Olympus",
  "Centric Sea Pattaya", "Lumpini Park Beach Jomtien", "Lumpini Ville Naklua - Wongamat",
  "Laguna Beach Resort 3 - The Maldives", "Laguna Beach Resort 2", "Amazon Residence",
  "Empire Tower Pattaya", "Baan Plai Haad", "Skyline Jomtien",
  "Nam Talay Condominium", "Espana Condo Resort Pattaya", "The Orient Resort & Spa",
  "Atlantis Condo Resort", "Grand Caribbean Condo Resort", "Nova Ocean View",
  "Wongamat Privacy Residence", "Serenity Wongamat", "Wongamat Tower",
  "La Santir Pattaya", "Pattaya Posh"
];

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log("Seeding an additional 100 condominiums (50 Bangkok, 50 Pattaya)...");
  
  let count = 0;
  
  for (const name of bangkokCondos) {
    const slug = generateSlug(name);
    await prisma.location.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name,
        city: "Bangkok",
        type: "condo",
        stars: 5, // For premium condos
        totalRooms: Math.floor(Math.random() * 800) + 200,
        averagePrice: `฿${(Math.floor(Math.random() * 5) + 3)},${Math.floor(Math.random() * 9)}00 / month`,
        transport: "BTS/MRT Access",
        nearbyAmenities: ["Shopping Mall", "Supermarket"]
      }
    });
    count++;
  }

  for (const name of pattayaCondos) {
    const slug = generateSlug(name);
    await prisma.location.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name,
        city: "Pattaya",
        type: "condo",
        stars: 4, // 4 to 5 star equivalents
        totalRooms: Math.floor(Math.random() * 800) + 200,
        averagePrice: `฿${(Math.floor(Math.random() * 3) + 1)},${Math.floor(Math.random() * 9)}00 / month`,
        transport: "Beach Access",
        nearbyAmenities: ["Beach", "Convenience Store"]
      }
    });
    count++;
  }

  console.log(`Successfully seeded ${count} top condominiums to PostgreSQL!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
