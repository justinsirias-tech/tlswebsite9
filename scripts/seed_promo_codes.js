require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const prisma = require('../src/lib/prisma').default;

async function main() {
  console.log("Seeding initial promo codes into database...");

  const initialCodes = [
    {
      code: "TLSWELCOME15",
      discountType: "PERCENTAGE",
      discountValue: 15,
      minOrderValue: 0,
      usageLimit: 500,
      usedCount: 28,
      expiryDate: "Valid through Sept 30, 2026",
      isActive: true,
      description: "15% off first laundry or dry cleaning booking"
    },
    {
      code: "WASHRIDER10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 300,
      usageLimit: 300,
      usedCount: 14,
      expiryDate: "Valid through Oct 15, 2026",
      isActive: true,
      description: "Wash & Fold 10kg bonus & complimentary ironing"
    },
    {
      code: "FREEDELIVERY",
      discountType: "FIXED",
      discountValue: 80,
      minOrderValue: 500,
      usageLimit: null,
      usedCount: 65,
      expiryDate: "Ongoing Offer",
      isActive: true,
      description: "Free pickup and delivery on orders over 500 THB"
    },
    {
      code: "EXPRESS20",
      discountType: "PERCENTAGE",
      discountValue: 20,
      minOrderValue: 0,
      usageLimit: 100,
      usedCount: 9,
      expiryDate: "Limited Time Flash Deal",
      isActive: true,
      description: "20% discount on same-day express turnaround"
    }
  ];

  for (const item of initialCodes) {
    const existing = await prisma.promoCode.findUnique({ where: { code: item.code } });
    if (!existing) {
      await prisma.promoCode.create({ data: item });
      console.log(`Created promo code: ${item.code}`);
    } else {
      console.log(`Promo code already exists: ${item.code}`);
    }
  }

  console.log("Promo codes seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
