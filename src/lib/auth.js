import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

export const verifyAuth = async (requiredPermission = null) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;
  
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // SUPERADMIN has access to everything
    if (payload.role === "SUPERADMIN") return payload;
    
    // Check specific permission if requested
    if (requiredPermission) {
      if (!payload.permissions || !payload.permissions.includes(requiredPermission)) {
        return null;
      }
    }
    
    return payload;
  } catch (err) {
    return null;
  }
};
