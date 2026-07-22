import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    hasGcsBucket: !!process.env.GCS_BUCKET,
    bucketName: process.env.GCS_BUCKET || null,
    nodeEnv: process.env.NODE_ENV
  });
}
