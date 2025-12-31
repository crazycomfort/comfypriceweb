// Session management for contractor authentication - Step 3
import { cookies } from "next/headers";

export type ContractorRole = "owner_admin" | "office" | "tech";

export interface ContractorSession {
  contractorId: string;
  companyId: string | null;
  role: ContractorRole;
  email: string;
}

const SESSION_COOKIE_NAME = "contractor_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Gets the current contractor session from cookies
 */
export async function getContractorSession(): Promise<ContractorSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie?.value) {
    return null;
  }
  
  try {
    const session = JSON.parse(sessionCookie.value) as ContractorSession;
    return session;
  } catch {
    return null;
  }
}

/**
 * Sets a contractor session in cookies
 */
export async function setContractorSession(session: ContractorSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * Clears the contractor session
 */
export async function clearContractorSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}


