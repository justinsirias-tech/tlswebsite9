require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const prisma = require('../src/lib/prisma').default;

async function main() {
  console.log("Seeding initial promotions into database...");

  const initialPromos = [
    {
      title: "First Order 15% Off",
      title_th: "ส่วนลด 15% สำหรับการสั่งซักครั้งแรก",
      title_cn: "首单预约 85 折优惠",
      description: "Enjoy 15% off your very first laundry or dry cleaning booking in Bangkok & Pattaya.",
      desc_th: "รับส่วนลดทันที 15% สำหรับบริการซักพับ ซักอบรีด หรือซักแห้งทุกประเภทในการสั่งครั้งแรก",
      desc_cn: "首次在曼谷或芭堤雅预约洗衣与干洗服务，即可享受 15% 立减优惠。",
      code: "TLSWELCOME15",
      badge: "15% OFF",
      badge_th: "ลด 15%",
      badge_cn: "85折",
      category: "welcome",
      validUntil: "Valid through Sept 30, 2026",
      isActive: true,
      sortOrder: 1
    },
    {
      title: "Wash & Fold 10kg Bonus",
      title_th: "ซักพับ 10 กก. แถมฟรีกระเป๋าและบริการรีดผ้า",
      title_cn: "水洗 10 公斤赠送精细熨烫",
      description: "Book 10kg or more of wash & fold and get free complimentary shirt pressing and garment bag.",
      desc_th: "เมื่อส่งซักพับครบ 10 กิโลกรัม รับฟรีกระเป๋าบรรจุผ้า premium และบริการอัดรีดเสื้อเชิ้ต",
      desc_cn: "预约 10 公斤及以上水洗折叠服务，免费赠送衬衫熨烫与防尘洗护袋。",
      code: "WASHRIDER10",
      badge: "FREE BONUS",
      badge_th: "แถมฟรี",
      badge_cn: "免费赠送",
      category: "monthly",
      validUntil: "Valid through Oct 15, 2026",
      isActive: true,
      sortOrder: 2
    },
    {
      title: "Free Delivery Over 500 THB",
      title_th: "ฟรีค่าจัดส่ง เมื่อใช้บริการครบ 500 บาท",
      title_cn: "满 500 泰铢免取送费",
      description: "Get 100% free doorstep pickup & delivery for all hotel, condo, and home bookings over 500 THB.",
      desc_th: "บริการรับ-ส่งผ้าฟรีถึงหน้าห้องคอนโดหรือโรงแรม เมื่อมียอดซักผ้าตั้งแต่ 500 บาทขึ้นไป",
      desc_cn: "在曼谷与芭堤雅订单满 500 泰铢，即享公寓及酒店上门免费取送。",
      code: "FREEDELIVERY",
      badge: "FREE SHIPPING",
      badge_th: "ส่งฟรี",
      badge_cn: "免运费",
      category: "monthly",
      validUntil: "Ongoing Offer",
      isActive: true,
      sortOrder: 3
    },
    {
      title: "Same-Day Express 20% Discount",
      title_th: "บริการซักด่วนภายในวัน ลด 20%",
      title_cn: "当日加急服务 20% 折扣",
      description: "Need clothes cleaned fast for your flight or event? Get 20% off express turnaround fee.",
      desc_th: "บริการซักด่วนพิเศษเสร็จภายในวันเดียว รับส่วนลดค่าบริการด่วน 20%",
      desc_cn: "航班หรือ活动急需衣物？享受同日加急加快费用 20% 优惠。",
      code: "EXPRESS20",
      badge: "EXPRESS DEAL",
      badge_th: "ซักด่วนพิเศษ",
      badge_cn: "加急特惠",
      category: "flash",
      validUntil: "Limited Time Flash Deal",
      isActive: true,
      sortOrder: 4
    }
  ];

  for (const promo of initialPromos) {
    const existing = await prisma.promotion.findFirst({ where: { code: promo.code } });
    if (!existing) {
      await prisma.promotion.create({ data: promo });
      console.log(`Created promotion: ${promo.title}`);
    } else {
      console.log(`Promotion already exists: ${promo.title}`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
