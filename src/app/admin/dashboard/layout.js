import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "../admin.module.css";

import { verifyAuth } from "../../../lib/auth";

export const metadata = {
  title: "Admin Dashboard | That Laundry Shop",
};

export default async function AdminLayout({ children }) {
  const user = await verifyAuth();

  if (!user) {
    redirect("/admin");
  }

  const isSuperadmin = user.role === "SUPERADMIN";
  const hasPerm = (perm) => isSuperadmin || (user.permissions && user.permissions.includes(perm));

  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <i className="fa-solid fa-shirt"></i>
          TLS Admin
        </div>
        <nav className={styles.sidebarNav}>
          <Link href="/admin/dashboard" className={styles.navLink}>
            <i className="fa-solid fa-chart-pie"></i> Dashboard
          </Link>
          {hasPerm('bookings') && (
            <Link href="/admin/dashboard/bookings" className={styles.navLink}>
              <i className="fa-solid fa-calendar-check"></i> Bookings
            </Link>
          )}
          {hasPerm('contacts') && (
            <Link href="/admin/dashboard/contacts" className={styles.navLink}>
              <i className="fa-solid fa-envelope"></i> Contact Requests
            </Link>
          )}
          {hasPerm('locations') && (
            <Link href="/admin/dashboard/locations" className={styles.navLink}>
              <i className="fa-solid fa-building"></i> Hotel Directory
            </Link>
          )}
          {hasPerm('pricing') && (
            <Link href="/admin/dashboard/pricing" className={styles.navLink}>
              <i className="fa-solid fa-tags"></i> Pricing Menu
            </Link>
          )}
          {hasPerm('articles') && (
            <Link href="/admin/dashboard/articles" className={styles.navLink}>
              <i className="fa-solid fa-file-lines"></i> Articles
            </Link>
          )}
          {isSuperadmin && (
            <Link href="/admin/dashboard/users" className={styles.navLink}>
              <i className="fa-solid fa-users-gear"></i> User Management
            </Link>
          )}
        </nav>
        <div style={{ padding: "2rem" }}>
          <Link href="/" className="btn btn-outline" style={{ color: "white", borderColor: "rgba(255,255,255,0.2)", width: "100%", justifyContent: "center" }}>
            <i className="fa-solid fa-arrow-left"></i> Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
