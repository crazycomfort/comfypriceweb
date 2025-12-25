// Execution authorization - Step 9
import { getContractorSession } from "./session";
import { ContractorRole } from "./session";

export interface ExecutionContext {
  actorId?: string;
  companyId?: string | null;
  role?: ContractorRole;
  isHomeowner?: boolean;
}

// Check if user can execute action
export async function canExecute(
  action: string,
  context: ExecutionContext
): Promise<boolean> {
  // Homeowner actions
  if (action.startsWith("homeowner:")) {
    return context.isHomeowner === true;
  }

  // Contractor actions require authentication
  if (action.startsWith("contractor:")) {
    if (!context.actorId || !context.companyId) {
      return false;
    }

    // Owner Admin has full access
    if (context.role === "owner_admin") {
      return true;
    }

    // Office and Tech have same page access but may have restrictions
    if (context.role === "office" || context.role === "tech") {
      // For now, same access as Owner Admin (can be restricted later)
      return true;
    }
  }

  // Company-scoped actions
  if (action.startsWith("company:")) {
    return !!context.companyId;
  }

  return false;
}

// Get execution context from request
export async function getExecutionContext(request?: Request): Promise<ExecutionContext> {
  try {
    const session = await getContractorSession();
    
    if (session) {
      return {
        actorId: session.contractorId,
        companyId: session.companyId,
        role: session.role,
        isHomeowner: false,
      };
    }
  } catch (error) {
    // If session check fails (e.g., in API route context), treat as homeowner
    console.log("Session check failed, treating as homeowner:", error);
  }

  // Default: no session = homeowner
  return {
    isHomeowner: true,
  };
}

