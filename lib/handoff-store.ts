// Shared handoff store (in production, use database)
// This is a temporary in-memory store for handoff data

interface HandoffData {
  estimateId: string;
  companyId: string;
  handedOffBy: string;
  handedOffTo: string;
  handedOffAt: string;
  status: "handed_off" | "in_progress" | "completed";
  lockedPricing: boolean;
  estimate: any;
  updatedAt?: string;
}

const handoffStore = new Map<string, HandoffData>();

export function getHandoff(estimateId: string): HandoffData | null {
  return handoffStore.get(estimateId) || null;
}

export function setHandoff(estimateId: string, handoff: HandoffData): void {
  handoffStore.set(estimateId, handoff);
}

export function getAllHandoffsForTech(techId: string, companyId: string): HandoffData[] {
  const handoffs: HandoffData[] = [];
  handoffStore.forEach((handoff) => {
    if (handoff.handedOffTo === techId && handoff.companyId === companyId) {
      handoffs.push(handoff);
    }
  });
  return handoffs;
}

export function updateHandoffStatus(estimateId: string, status: "in_progress" | "completed"): boolean {
  const handoff = handoffStore.get(estimateId);
  if (!handoff) {
    return false;
  }
  handoff.status = status;
  handoff.updatedAt = new Date().toISOString();
  handoffStore.set(estimateId, handoff);
  return true;
}



