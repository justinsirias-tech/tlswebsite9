import { SignJWT } from "jose";

const baseUrl = 'http://localhost:3000';
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

async function testWithValidAuth() {
  const token = await new SignJWT({
    id: "test-superadmin-id",
    email: "justin@thatlaundryshop.com",
    role: "SUPERADMIN",
    permissions: []
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(JWT_SECRET);

  const authCookie = `adminToken=${token}; isAdmin=true`;

  const adminPages = [
    '/admin/dashboard',
    '/admin/dashboard/locations',
    '/admin/dashboard/articles',
    '/admin/dashboard/pricing',
    '/admin/dashboard/prices',
    '/admin/dashboard/bookings',
    '/admin/dashboard/analytics',
    '/admin/dashboard/contacts',
    '/admin/dashboard/marketing',
    '/admin/dashboard/memberships',
    '/admin/dashboard/partners',
    '/admin/dashboard/popups',
    '/admin/dashboard/promo-codes',
    '/admin/dashboard/promotions',
    '/admin/dashboard/services',
    '/admin/dashboard/terms',
    '/admin/dashboard/users'
  ];

  const adminApis = [
    '/api/admin/promo-codes',
    '/api/admin/promotions',
    '/api/admin/repair-directory',
    '/api/admin/partners',
    '/api/admin/popups',
    '/api/admin/terms',
    '/api/admin/users',
    '/api/admin/analytics'
  ];

  console.log('--- Testing Admin Dashboard Pages with Signed JWT ---');
  let failures = 0;
  for (const page of adminPages) {
    const res = await fetch(baseUrl + page, {
      headers: { cookie: authCookie },
      redirect: 'manual'
    });
    const text = await res.text();
    const hasError = text.includes('Application error') || 
                     text.includes('Internal Server Error') || 
                     text.includes('Unhandled Runtime Error');
    const isOk = res.status === 200 && !hasError;
    if (!isOk) failures++;
    console.log(`[${res.status}] ${page.padEnd(35)} -> ${isOk ? 'OK' : 'FAIL (redirect or error)'}`);
  }

  console.log('\n--- Testing Admin APIs with Signed JWT ---');
  for (const api of adminApis) {
    const res = await fetch(baseUrl + api, {
      headers: { cookie: authCookie }
    });
    const isOk = res.status === 200;
    if (!isOk) failures++;
    console.log(`[${res.status}] ${api.padEnd(35)} -> ${isOk ? 'OK' : 'FAIL'}`);
  }

  console.log(`\nAdmin Auth Audit: ${failures === 0 ? 'ALL PASSED!' : failures + ' failed'}`);
}

testWithValidAuth();
