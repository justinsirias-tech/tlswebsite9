import { NextResponse } from "next/server";

export const POS_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-tls-pos-key, x-api-key",
};

/**
 * Verify POS API Key from request headers
 * Supports:
 * - x-tls-pos-key: <key>
 * - x-api-key: <key>
 * - Authorization: Bearer <key>
 */
export function verifyPosKey(request) {
  const secret = process.env.POS_API_SECRET || "tls_pos_secret_key_dev_2026";
  
  const headerKey = request.headers.get("x-tls-pos-key") || request.headers.get("x-api-key");
  if (headerKey && headerKey.trim() === secret) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token === secret) {
      return true;
    }
  }

  return false;
}

/**
 * Returns a standard JSON response with POS CORS headers attached
 */
export function posJsonResponse(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: POS_CORS_HEADERS,
  });
}

/**
 * Handles CORS Preflight OPTIONS request
 */
export function handleCorsPreflight() {
  return new Response(null, {
    status: 204,
    headers: POS_CORS_HEADERS,
  });
}
