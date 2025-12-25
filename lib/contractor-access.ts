// Contractor access gating - Step 3
// Real session-based access control

import { getContractorSession } from "./session";
import { getContractorById } from "./storage";

/**
 * Checks if dev bypass is enabled (development only, ignored in production)
 * @returns boolean - true only if DEV_BYPASS_AUTH env var is set AND not in production
 */
function isDevBypassEnabled(): boolean {
  // Only allow bypass in development, never in production
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return process.env.DEV_BYPASS_AUTH === "true";
}

/**
 * Checks if the current user has contractor access (authenticated)
 * @returns boolean - true if user has contractor access
 */
export async function hasContractorAccess(): Promise<boolean> {
  // Dev bypass: only in development with explicit env var
  if (isDevBypassEnabled()) {
    return true;
  }
  
  const session = await getContractorSession();
  if (!session) {
    return false;
  }
  
  // Verify contractor still exists
  const contractor = await getContractorById(session.contractorId);
  return contractor !== null;
}

/**
 * Gets contractor user information from session
 * @returns Contractor info or null if not a contractor
 */
export async function getContractorInfo(): Promise<{ id: string; companyId: string | null; role: string } | null> {
  // Dev bypass: only in development with explicit env var
  if (isDevBypassEnabled()) {
    return {
      id: "dev-bypass-contractor-id",
      companyId: "dev-bypass-company-id",
      role: "owner_admin",
    };
  }
  
  const session = await getContractorSession();
  if (!session) {
    return null;
  }
  
  // Verify contractor still exists
  const contractor = await getContractorById(session.contractorId);
  if (!contractor) {
    return null;
  }
  
  return {
    id: session.contractorId,
    companyId: session.companyId,
    role: session.role,
  };
}

