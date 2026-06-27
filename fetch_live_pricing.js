const https = require('https');

const url = 'https://thatlaundryshop.com/api/pricing';

console.log("Fetching live pricing from:", url);

const req = https.get(url, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const pricing = JSON.parse(data);
      console.log(`Total items fetched: ${pricing.length}`);
      pricing.forEach((item, idx) => {
        console.log(`${idx + 1}. [${item.category}] ${item.name} | Non-Member: ฿${item.nonMember} | Member: ${item.member || '-'}`);
      });
    } catch (err) {
      console.log("Failed to parse JSON response:", err.message);
      console.log("Raw response snippet:", data.substring(0, 1000));
    }
  });
});

req.on('error', (e) => {
  console.error("Request error:", e);
});
