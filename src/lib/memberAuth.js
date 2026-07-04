import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

export async function getMemberFromSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("memberToken")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error("Member token verify error:", error);
    return null;
  }
}
