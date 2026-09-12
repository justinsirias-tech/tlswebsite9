import { SignJWT } from "jose";

const baseUrl = 'http://localhost:3000';
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

const publicPages = [
  '/',
  '/en',
  '/th',
  '/cn',
  '/en/services',
  '/en/pricing',
  '/en/booking',
  '/en/about',
  '/en/contact',
  '/en/promotions',
  '/en/terms',
  '/en/hotels',
  '/en/condominiums',
  '/en/articles',
  '/th/services',
  '/th/pricing',
  '/th/booking',
  '/th/hotels',
  '/th/condominiums',
  '/th/articles',
  '/cn/services',
  '/cn/pricing',
  '/cn/booking',
  '/cn/hotels',
  '/cn/condominiums',
  '/cn/articles'
];

const adminPages = [
  '/admin',
  '/admin/login',
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

const apiEndpoints = [
  { url: '/api/hotels', method: 'GET' },
  { url: '/api/articles', method: 'GET' },
  { url: '/api/pricing', method: 'GET' },
  { url: '/api/promotions', method: 'GET' },
  { url: '/api/active-popup', method: 'GET' },
  { url: '/api/admin/promo-codes', method: 'GET', admin: true },
  { url: '/api/admin/partners', method: 'GET', admin: true },
  { url: '/api/admin/repair-directory', method: 'GET', admin: true },
  { url: '/api/admin/analytics', method: 'GET', admin: true }
];

async function runComprehensiveAudit() {
  console.log('=== STARTING COMPLETE PRODUCTION-GRADE HEALTH AUDIT ===\n');
  let errors = [];
  let passed = 0;

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

  console.log('--- 1. Testing Public Localized Pages ---');
  for (const path of publicPages) {
    try {
      const res = await fetch(baseUrl + path);
      const text = await res.text();
      const hasError = text.includes('Application error') || 
                       text.includes('Internal Server Error') || 
                       text.includes('Unhandled Runtime Error');
      if (res.status >= 200 && res.status < 400 && !hasError) {
        passed++;
        console.log(`✓ [${res.status}] ${path}`);
      } else {
        errors.push({ path, status: res.status, hasError });
        console.error(`✗ [${res.status}] ${path} (Error in content: ${hasError})`);
      }
    } catch (err) {
      errors.push({ path, error: err.message });
      console.error(`✗ [ERR] ${path}: ${err.message}`);
    }
  }

  console.log('\n--- 2. Testing Dynamic Directory & Article Pages ---');
  const dynamicPaths = [
    '/en/hotels/the-siam-hotel',
    '/th/hotels/the-siam-hotel',
    '/en/condominiums/the-river-condominium',
    '/th/condominiums/the-river-condominium',
    '/en/hotels/shama-lakeview-asoke'
  ];

  try {
    const artRes = await fetch(baseUrl + '/api/articles');
    const articles = await artRes.json();
    if (Array.isArray(articles) && articles.length > 0) {
      dynamicPaths.push(`/en/articles/${articles[0].id}`);
      dynamicPaths.push(`/th/articles/${articles[0].id}`);
    }
  } catch (e) {}

  for (const path of dynamicPaths) {
    try {
      const res = await fetch(baseUrl + path);
      const text = await res.text();
      const hasError = text.includes('Application error') || 
                       text.includes('Internal Server Error') || 
                       text.includes('Unhandled Runtime Error');
      if (res.status >= 200 && res.status < 400 && !hasError) {
        passed++;
        console.log(`✓ [${res.status}] ${path}`);
      } else {
        errors.push({ path, status: res.status, hasError });
        console.error(`✗ [${res.status}] ${path} (Error in content: ${hasError})`);
      }
    } catch (err) {
      errors.push({ path, error: err.message });
      console.error(`✗ [ERR] ${path}: ${err.message}`);
    }
  }

  console.log('\n--- 3. Testing Admin Dashboard Pages ---');
  for (const path of adminPages) {
    try {
      const res = await fetch(baseUrl + path, {
        headers: { cookie: authCookie }
      });
      const text = await res.text();
      const hasError = text.includes('Application error') || 
                       text.includes('Internal Server Error') || 
                       text.includes('Unhandled Runtime Error');
      if (res.status >= 200 && res.status < 400 && !hasError) {
        passed++;
        console.log(`✓ [${res.status}] ${path}`);
      } else {
        errors.push({ path, status: res.status, hasError });
        console.error(`✗ [${res.status}] ${path} (Error in content: ${hasError})`);
      }
    } catch (err) {
      errors.push({ path, error: err.message });
      console.error(`✗ [ERR] ${path}: ${err.message}`);
    }
  }

  console.log('\n--- 4. Testing API Endpoints ---');
  for (const api of apiEndpoints) {
    try {
      const headers = api.admin ? { cookie: authCookie } : {};
      const res = await fetch(baseUrl + api.url, { method: api.method, headers });
      if (res.status >= 200 && res.status < 400) {
        passed++;
        console.log(`✓ [${res.status}] ${api.method} ${api.url}`);
      } else {
        errors.push({ path: api.url, status: res.status });
        console.error(`✗ [${res.status}] ${api.method} ${api.url}`);
      }
    } catch (err) {
      errors.push({ path: api.url, error: err.message });
      console.error(`✗ [ERR] ${api.url}: ${err.message}`);
    }
  }

  console.log('\n========================================');
  console.log(`Final Result: ${passed} passed, ${errors.length} failed.`);
  if (errors.length > 0) {
    console.log('Failed items:', JSON.stringify(errors, null, 2));
  } else {
    console.log('🎉 100% HEALTHY: ALL ROUTES, PAGES, AND APIS PASSED WITH ZERO ISSUES!');
  }
  console.log('========================================\n');
}

runComprehensiveAudit();
