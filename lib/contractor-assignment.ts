/**
 * CONTRACTOR ASSIGNMENT LOGIC
 * 
 * Prevents price-shopping behavior by enforcing:
 * - One active contractor at a time per homeowner
 * - No simultaneous multi-contractor blasts
 * - Contractor assignment is invisible to homeowner
 * 
 * This preserves trust, pricing integrity, and contractor confidence.
 */

// In-memory store for contractor assignments
// In production, this should be stored in a database
const contractorAssignments = new Map<string, {
  estimateId: string;
  assignedCompanyId: string;
  assignedAt: string;
  status: "active" | "completed" | "cancelled";
}>();

/**
 * Check if a homeowner (estimate) already has an active contractor assignment
 */
export function hasActiveContractorAssignment(estimateId: string): boolean {
  const assignment = contractorAssignments.get(estimateId);
  return assignment !== undefined && assignment.status === "active";
}

/**
 * Get the assigned contractor company ID for an estimate
 */
export function getAssignedContractor(estimateId: string): string | null {
  const assignment = contractorAssignments.get(estimateId);
  if (assignment && assignment.status === "active") {
    return assignment.assignedCompanyId;
  }
  return null;
}

/**
 * Assign a contractor to a homeowner estimate
 * Returns true if assignment was successful, false if already assigned
 */
export function assignContractor(estimateId: string, companyId: string): boolean {
  // Check if already assigned
  if (hasActiveContractorAssignment(estimateId)) {
    return false; // Already assigned, prevent multiple assignments
  }
  
  // Create new assignment
  contractorAssignments.set(estimateId, {
    estimateId,
    assignedCompanyId: companyId,
    assignedAt: new Date().toISOString(),
    status: "active",
  });
  
  return true;
}

/**
 * Update assignment status (e.g., when lead is completed or cancelled)
 */
export function updateAssignmentStatus(
  estimateId: string,
  status: "active" | "completed" | "cancelled"
): boolean {
  const assignment = contractorAssignments.get(estimateId);
  if (!assignment) {
    return false;
  }
  
  assignment.status = status;
  contractorAssignments.set(estimateId, assignment);
  return true;
}

/**
 * Get all assignments for a company (for contractor view)
 */
export function getAssignmentsByCompany(companyId: string): Array<{
  estimateId: string;
  assignedAt: string;
  status: "active" | "completed" | "cancelled";
}> {
  const assignments: Array<{
    estimateId: string;
    assignedAt: string;
    status: "active" | "completed" | "cancelled";
  }> = [];
  
  for (const [estimateId, assignment] of contractorAssignments.entries()) {
    if (assignment.assignedCompanyId === companyId) {
      assignments.push({
        estimateId,
        assignedAt: assignment.assignedAt,
        status: assignment.status,
      });
    }
  }
  
  return assignments;
}



