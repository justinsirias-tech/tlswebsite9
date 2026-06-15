import prisma from "../../../../lib/prisma";
import styles from "../../admin.module.css";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

async function updateStatus(formData) {
  "use server";
  const id = formData.get("id");
  const action = formData.get("action");
  await prisma.booking.update({
    where: { id },
    data: { status: action === "CLOSE" ? "CLOSED" : "CANCELLED" }
  });
  revalidatePath('/admin/dashboard/bookings');
}

export default async function BookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 style={{ color: "var(--primary)" }}>Manage Bookings</h1>
          <p style={{ color: "var(--text-light)" }}>View all customer booking requests.</p>
        </div>
      </div>
      
      <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
        {bookings.length === 0 ? (
          <p style={{ color: "var(--text-light)" }}>No bookings found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {bookings.map(booking => (
              <div key={booking.id} style={{ padding: "1.5rem", background: "var(--background)", borderRadius: "8px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", alignItems: "center" }}>
                <div>
                  <strong>{booking.customerName}</strong>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>{booking.email} | {booking.phone}</p>
                </div>
                <div>
                  <span style={{ fontWeight: "600", color: "var(--primary)" }}>{booking.service}</span>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>Pickup: {new Date(booking.pickupDate).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                  <span style={{ 
                    display: "inline-block", padding: "0.4rem 0.8rem", borderRadius: "50px", fontSize: "0.8rem", fontWeight: "600",
                    background: booking.status === 'PENDING' ? "rgba(245, 158, 11, 0.1)" : booking.status === 'CANCELLED' ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                    color: booking.status === 'PENDING' ? "#f59e0b" : booking.status === 'CANCELLED' ? "#ef4444" : "#10b981"
                  }}>
                    {booking.status}
                  </span>
                  {booking.status === 'PENDING' && (
                    <form action={updateStatus} style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                      <input type="hidden" name="id" value={booking.id} />
                      <button type="submit" name="action" value="CLOSE" className="btn btn-primary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", borderRadius: "4px" }}>Close</button>
                      <button type="submit" name="action" value="CANCEL" className="btn btn-outline" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", borderRadius: "4px" }}>Cancel</button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
