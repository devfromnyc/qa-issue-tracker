import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  return getOptionalSession();
}

/** Returns null when auth is not configured or session lookup fails. */
export async function getOptionalSession() {
  if (!process.env.NEXTAUTH_SECRET) {
    return null;
  }

  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getOptionalSession();
  if (!session?.user?.id) {
    return null;
  }
  return session;
}
