import prisma from "../../../../lib/prisma";
import prismaWebapp from "../../../../lib/prisma-webapp";
import styles from "../../admin.module.css";
import MembershipRequestsList from "./RequestsList";

export const dynamic = 'force-dynamic';

export default async function MembershipsAdminPage() {
  const requests = await prisma.membershipRequest.findMany({
    orderBy: { createdAt: "desc" }
  });

  const members = await prismaWebapp.member.findMany({
    where: { isMember: true },
    orderBy: { createdAt: "desc" }
  });

  // Serialize Date objects to strings for Client Component usage
  const serializedRequests = requests.map(req => ({
    ...req,
    createdAt: req.createdAt ? req.createdAt.toISOString() : null,
    updatedAt: req.updatedAt ? req.updatedAt.toISOString() : null,
  }));

  const serializedMembers = members.map(m => ({
    ...m,
    createdAt: m.createdAt ? m.createdAt.toISOString() : null,
    updatedAt: m.updatedAt ? m.updatedAt.toISOString() : null,
  }));

  return (
    <div>
      <div className={styles.pageHeader} style={{ marginBottom: "2rem" }}>
        <div>
          <h1 style={{ color: "var(--primary)" }}>
            <i className="fa-solid fa-id-card"></i> Membership Applications
          </h1>
          <p style={{ color: "var(--text-light)" }}>
            Follow up, approve validity periods, and manage profiles for monthly members.
          </p>
        </div>
      </div>
      
      <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
        <MembershipRequestsList 
          initialRequests={serializedRequests} 
          initialMembers={serializedMembers} 
        />
      </div>
    </div>
  );
}
