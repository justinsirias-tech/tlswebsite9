import prisma from "../../../../lib/prisma";
import styles from "../../admin.module.css";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

async function updateMembershipStatus(formData) {
  "use server";
  const id = formData.get("id");
  await prisma.membershipRequest.update({
    where: { id },
    data: { status: "CLOSED" }
  });
  revalidatePath('/admin/dashboard/memberships');
}

export default async function MembershipsAdminPage() {
  const requests = await prisma.membershipRequest.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className={styles.pageHeader} style={{ marginBottom: "2rem" }}>
        <div>
          <h1 style={{ color: "var(--primary)" }}><i className="fa-solid fa-id-card"></i> Membership Applications</h1>
          <p style={{ color: "var(--text-light)" }}>Follow up with customers interested in monthly membership packages.</p>
        </div>
      </div>
      
      <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
        {requests.length === 0 ? (
          <p style={{ color: "var(--text-light)", textAlign: "center", padding: "2rem" }}>No membership applications found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {requests.map(req => (
              <div key={req.id} style={{ padding: "1.5rem", background: "var(--background)", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
                  <div>
                    <strong style={{ fontSize: "1.15rem", color: "var(--primary)" }}>{req.name}</strong>
                    <span style={{ marginLeft: "1rem", fontSize: "0.95rem", color: "var(--text-light)" }}>
                      <i className="fa-solid fa-envelope" style={{ marginRight: "4px" }}></i> {req.email}
                    </span>
                    <span style={{ marginLeft: "1rem", fontSize: "0.95rem", color: "var(--text-light)" }}>
                      <i className="fa-solid fa-phone" style={{ marginRight: "4px" }}></i> {req.phone}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <span style={{ 
                      display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "50px", fontSize: "0.75rem", fontWeight: "700",
                      background: req.status === 'PENDING' ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)",
                      color: req.status === 'PENDING' ? "#f59e0b" : "#10b981"
                    }}>
                      {req.status}
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", margin: "1rem 0", background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-light)", fontWeight: "600" }}>Requested Package</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--primary)", textTransform: "capitalize", marginTop: "2px" }}>
                      {req.tier} Package
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-light)", fontWeight: "600" }}>Subscription Term</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--primary)", marginTop: "2px" }}>
                      {req.term}
                    </div>
                  </div>
                  {req.dob && (
                    <div>
                      <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-light)", fontWeight: "600" }}>Date of Birth</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--primary)", marginTop: "2px" }}>
                        {req.dob}
                      </div>
                    </div>
                  )}
                  {req.address && (
                    <div style={{ gridColumn: "span 2" }}>
                      <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-light)", fontWeight: "600" }}>Building Address</div>
                      <div style={{ fontSize: "1rem", fontWeight: "600", color: "var(--primary)", marginTop: "2px" }}>
                        {req.address} {req.roomNo && <span style={{ background: "rgba(245, 158, 11, 0.1)", color: "#b45309", padding: "2px 6px", borderRadius: "4px", fontSize: "0.8rem", marginLeft: "6px", fontWeight: "bold" }}>Room {req.roomNo}</span>}
                      </div>
                    </div>
                  )}
                </div>

                {req.notes && (
                  <p style={{ color: "var(--text-color)", marginTop: "0.5rem", fontStyle: "italic", lineHeight: "1.5", padding: "1rem", background: "rgba(255, 237, 213, 0.2)", borderRadius: "8px", border: "1px solid rgba(245, 158, 11, 0.15)" }}>
                    " {req.notes} "
                  </p>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                  <a href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", background: "#25d366", color: "white", display: "flex", alignItems: "center", gap: "4px" }}>
                    <i className="fa-brands fa-whatsapp"></i> Chat WhatsApp
                  </a>
                  {req.status === 'PENDING' && (
                    <form action={updateMembershipStatus}>
                      <input type="hidden" name="id" value={req.id} />
                      <button type="submit" className="btn btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                        Mark as Contacted / Closed
                      </button>
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
