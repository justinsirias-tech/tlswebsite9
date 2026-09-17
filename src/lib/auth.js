import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "./prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

export const verifyAuth = async (requiredPermission = null) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;
  
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    let role = payload.role;
    let permissions = payload.permissions || [];

    // Fetch fresh permissions from DB so permission changes take effect immediately without needing re-login
    if (payload.id) {
      try {
        const dbUser = await prisma.websiteAdminUser.findUnique({
          where: { id: payload.id },
          select: { role: true, permissions: true }
        });
        if (dbUser) {
          role = dbUser.role;
          permissions = dbUser.permissions || [];
        }
      } catch (dbErr) {
        // Fallback to JWT payload if DB query fails
      }
    }

    // SUPERADMIN has access to everything
    if (role === "SUPERADMIN") return { ...payload, role, permissions };
    
    // Check specific permission if requested
    if (requiredPermission) {
      if (!permissions || !permissions.includes(requiredPermission)) {
        return null;
      }
    }
    
    return { ...payload, role, permissions };
  } catch (err) {
    return null;
  }
};
