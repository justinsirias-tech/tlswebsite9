"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (!isAdmin && pathname) {
      // Record real pageview to PostgreSQL database
      fetch("/api/log-pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          referrer: typeof document !== "undefined" ? document.referrer : ""
        })
      }).catch(() => {});
    }
  }, [pathname, isAdmin]);

  return (
    <>
      {!isAdmin && <Header />}
      <main>
        {children}
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
