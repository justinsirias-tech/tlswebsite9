import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Create new booking in PostgreSQL
    const newBooking = await prisma.booking.create({
      data: {
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        pickupDate: new Date(data.pickupDate),
        service: data.service,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, booking: newBooking }, { status: 200 });
  } catch (error) {
    console.error("Failed to create booking", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
