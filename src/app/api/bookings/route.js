import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "../../../lib/prisma";

// Protect route helper
const isAuthenticated = async () => {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("isAdmin");
  return isAdmin && isAdmin.value === "true";
};

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

export async function PUT(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { id, status, assignedToId } = data;

    if (!id) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    // Allow assigning to null (unassigned)
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, booking: updatedBooking }, { status: 200 });
  } catch (error) {
    console.error("Failed to update booking", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

