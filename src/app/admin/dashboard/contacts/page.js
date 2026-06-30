import prisma from "../../../../lib/prisma";
import styles from "../../admin.module.css";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

async function updateContactStatus(formData) {
  "use server";
  const id = formData.get("id");
  await prisma.contactRequest.update({
    where: { id },
    data: { status: "CLOSED" }
  });
  revalidatePath('/admin/dashboard/contacts');
}

export default async function ContactsPage() {
  const contacts = await prisma.contactRequest.findMany({
    orderBy: { createdAt: "desc" }
  });

  const formatDate = (dateInput) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 style={{ color: "var(--primary)" }}>Contact Requests</h1>
          <p style={{ color: "var(--text-light)" }}>View all messages submitted by customers.</p>
        </div>
      </div>
      
      <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
        {contacts.length === 0 ? (
          <p style={{ color: "var(--text-light)" }}>No contact requests found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {contacts.map(contact => (
              <div key={contact.id} style={{ padding: "1.5rem", background: "var(--background)", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <div>
                    <strong style={{ fontSize: "1.1rem" }}>{contact.name}</strong>
                    <span style={{ marginLeft: "1rem", fontSize: "0.9rem", color: "var(--text-light)" }}>{contact.email}</span>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <span style={{ 
                      display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "50px", fontSize: "0.75rem", fontWeight: "600",
                      background: contact.status === 'PENDING' ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)",
                      color: contact.status === 'PENDING' ? "#f59e0b" : "#10b981"
                    }}>
                      {contact.status}
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>{formatDate(contact.createdAt)}</span>
                  </div>
                </div>
                <p style={{ color: "var(--text-color)", marginTop: "1rem", lineHeight: "1.6", padding: "1rem", background: "white", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  {contact.message}
                </p>
                {contact.status === 'PENDING' && (
                  <form action={updateContactStatus} style={{ marginTop: "1rem", textAlign: "right" }}>
                    <input type="hidden" name="id" value={contact.id} />
                    <button type="submit" className="btn btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                      Mark as Closed
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
