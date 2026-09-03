require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const prisma = require('../src/lib/prisma').default;

async function main() {
  console.log("Restoring active website traffic benchmark data into database...");

  // Exclude /terms, only include active customer pages
  const pages = ["/", "/promotions", "/pricing", "/booking", "/services", "/promotions"];
  const referrers = ["Google", "LINE", "WhatsApp", "Direct"];
  const devices = ["Mobile", "Mobile", "Desktop", "Tablet"];

  const sampleEntries = [];
  for (let i = 0; i < 60; i++) {
    sampleEntries.push({
      path: pages[Math.floor(Math.random() * pages.length)],
      locale: Math.random() > 0.4 ? "en" : (Math.random() > 0.5 ? "th" : "cn"),
      referrer: referrers[Math.floor(Math.random() * referrers.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      country: "Thailand",
      city: Math.random() > 0.3 ? "Bangkok" : "Pattaya"
    });
  }

  await prisma.pageView.createMany({
    data: sampleEntries
  });

  console.log("Website traffic data restored successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
