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

const bangkokHotels = [
  "The Sukhothai Bangkok", "COMO Metropolitan Bangkok", "The Athenee Hotel", 
  "Rosewood Bangkok", "W Bangkok", "Kimpton Maa-Lai Bangkok", "Sindhorn Kempinski",
  "Anantara Siam Bangkok", "Anantara Riverside Bangkok", "Capella Bangkok",
  "Four Seasons Hotel Bangkok at Chao Phraya River", "The Salil Hotel Riverside",
  "Millennium Hilton Bangkok", "Royal Orchid Sheraton Hotel", "Chatrium Hotel Riverside",
  "Avani+ Riverside Bangkok", "Banyan Tree Bangkok", "Lebua at State Tower",
  "The Standard, Bangkok Mahanakhon", "SO/ Bangkok", "Conrad Bangkok",
  "Park Hyatt Bangkok", "Grand Hyatt Erawan", "JW Marriott Hotel Bangkok",
  "Sheraton Grande Sukhumvit", "The Westin Grande Sukhumvit", "Pullman Bangkok Grande Sukhumvit",
  "Carlton Hotel Bangkok Sukhumvit", "Meliá Chiang Mai", "Bangkok Marriott Hotel Sukhumvit",
  "Akyra TAS Sukhumvit Bangkok", "Hotel Muse Bangkok", "Sindhorn Midtown Hotel",
  "Courtyard by Marriott Bangkok", "Renaissance Bangkok Ratchaprasong", "Centara Grand at CentralWorld",
  "Novotel Bangkok on Siam Square", "Siam@Siam Design Hotel", "Pathumwan Princess Hotel",
  "Amari Watergate Bangkok", "Pullman Bangkok King Power", "The Berkeley Hotel Pratunam",
  "Sukosol Hotel", "Eastin Grand Hotel Sathorn", "U Sathorn Bangkok",
  "Ascott Sathorn Bangkok", "Sathorn Vista, Bangkok - Marriott Executive Apartments",
  "Somerset Park Suanplu", "Fraser Suites Sukhumvit", "Emporium Suites by Chatrium",
  "Oakwood Premier Cozmo"
];

const pattayaHotels = [
  "InterContinental Pattaya Resort", "Ana Anan Resort & Villas", "Navana Nature Escape",
  "Veranda Resort Pattaya", "Renaissance Pattaya Resort & Spa", "Mason Pattaya",
  "U Pattaya", "Centara Grand Mirage Beach Resort", "Pullman Pattaya Hotel G",
  "Dusit Thani Pattaya", "Amari Pattaya", "Holiday Inn Pattaya", "Hilton Pattaya",
  "Hard Rock Hotel Pattaya", "Siam Bayshore Resort Pattaya", "Royal Cliff Beach Hotel",
  "Royal Wing Suites & Spa", "Cape Dara Resort", "Grande Centre Point Pattaya",
  "Grande Centre Point Space Pattaya", "Avani Pattaya Resort", "OZO North Pattaya",
  "Mera Mare Pattaya", "Mytt Beach Hotel", "Hotel Baraquda Pattaya",
  "Arbour Hotel and Residence", "Altera Hotel and Residence", "Somerset Pattaya",
  "Centre Point Prime Hotel Pattaya", "Brighton Grand Hotel Pattaya", "LK Emerald Beach",
  "LK The Empress", "Pattaya Discovery Beach Hotel", "Wave Hotel Pattaya",
  "A-One The Royal Cruise Hotel", "Centara Azure Hotel Pattaya", "Citrus Grande Hotel Pattaya",
  "Hotel Amber Pattaya", "Golden Tulip Pattaya Beach Resort", "Z Through By The Zign",
  "The Zign Hotel", "Cholchan Pattaya Beach Resort", "Sea Sand Sun Resort and Villas",
  "Andaz Pattaya Jomtien Beach", "Mövenpick Siam Hotel Na Jomtien", "Ravindra Beach Resort & Spa",
  "Pinnacle Grand Jomtien Resort", "D Varee Jomtien Beach", "Jomtien Palm Beach Hotel",
  "Rabbit Resort Pattaya"
];

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log("Seeding an additional 100 hotels (50 Bangkok, 50 Pattaya)...");
  
  let count = 0;
  
  for (const name of bangkokHotels) {
    const slug = generateSlug(name);
    await prisma.location.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name,
        city: "Bangkok",
        type: "hotel",
        stars: 5,
        totalRooms: Math.floor(Math.random() * 400) + 100,
        averagePrice: `฿${(Math.floor(Math.random() * 5) + 3)},${Math.floor(Math.random() * 9)}00`,
        transport: "Central Bangkok",
        nearbyAmenities: ["Shopping Mall", "BTS Skytrain"]
      }
    });
    count++;
  }

  for (const name of pattayaHotels) {
    const slug = generateSlug(name);
    await prisma.location.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name,
        city: "Pattaya",
        type: "hotel",
        stars: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        totalRooms: Math.floor(Math.random() * 400) + 100,
        averagePrice: `฿${(Math.floor(Math.random() * 4) + 2)},${Math.floor(Math.random() * 9)}00`,
        transport: "Beachfront",
        nearbyAmenities: ["Beach Access", "Restaurants"]
      }
    });
    count++;
  }

  console.log(`Successfully seeded ${count} top hotels to PostgreSQL!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
