const fs = require('fs');
const hotels = JSON.parse(fs.readFileSync('src/data/hotels.json', 'utf8'));

const bkk = hotels.filter(h => h.city === 'Bangkok').sort((a,b) => a.name.localeCompare(b.name));
const pattaya = hotels.filter(h => h.city === 'Pattaya').sort((a,b) => a.name.localeCompare(b.name));

console.log('BANGKOK:');
bkk.forEach(h => console.log('- ' + h.name + ' (' + h.type + ')'));

console.log('\nPATTAYA:');
pattaya.forEach(h => console.log('- ' + h.name + ' (' + h.type + ')'));
