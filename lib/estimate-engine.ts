// Estimate engine - Step 4
// Stubbed pricing logic (no real calculations, deterministic outputs)

export interface EstimateInput {
  zipCode: string;
  squareFootage: number;
  floors: number;
  homeAge: string;
  existingSystem?: {
    hasExisting: boolean;
    systemType?: string;
    systemAge?: number;
    condition?: string;
  };
  preferences: {
    efficiencyLevel: string;
    systemType: string;
    smartFeatures: boolean;
  };
  installationFactors?: {
    accessDifficulty?: string;
    permits?: string;
    timeline?: string;
  };
}

export interface CostBreakdown {
  equipment: number;
  labor: number;
  materials: number;
  total: number;
}

export interface EstimateResult {
  estimateId: string;
  input: EstimateInput;
  costBreakdown: CostBreakdown;
  range: {
    min: number;
    max: number;
  };
  assumptions: string[];
  createdAt: string;
  version: string;
  _submissionId?: string; // Internal tracking only, not used for routing or user-facing links
}

// Deterministic estimate generation (same inputs -> same outputs)
export function generateEstimate(input: EstimateInput): EstimateResult {
  // STUB: Deterministic pricing based on inputs
  // In production, this would use real pricing engine
  
  const baseEquipment = 3000;
  const baseLabor = 2000;
  const baseMaterials = 1000;
  
  // Deterministic multipliers based on inputs
  const sqftMultiplier = Math.floor(input.squareFootage / 1000) * 0.1 + 1;
  const efficiencyMultiplier = input.preferences.efficiencyLevel === "premium" ? 1.5 : 
                                input.preferences.efficiencyLevel === "standard" ? 1.2 : 1.0;
  const systemTypeMultiplier = input.preferences.systemType === "heat-pump" ? 1.3 :
                               input.preferences.systemType === "dual-fuel" ? 1.4 : 1.0;
  const smartFeaturesMultiplier = input.preferences.smartFeatures ? 1.15 : 1.0;
  const accessMultiplier = input.installationFactors?.accessDifficulty === "difficult" ? 1.2 :
                            input.installationFactors?.accessDifficulty === "average" ? 1.1 : 1.0;
  
  // Calculate costs (deterministic)
  const equipment = Math.round(baseEquipment * sqftMultiplier * efficiencyMultiplier * systemTypeMultiplier * smartFeaturesMultiplier);
  const labor = Math.round(baseLabor * sqftMultiplier * accessMultiplier);
  const materials = Math.round(baseMaterials * sqftMultiplier);
  const total = equipment + labor + materials;
  
  // Generate range (±15%)
  const range = {
    min: Math.round(total * 0.85),
    max: Math.round(total * 1.15),
  };
  
  // Generate assumptions
  const assumptions = [
    `Based on ${input.squareFootage} sqft home`,
    `${input.preferences.efficiencyLevel} efficiency tier`,
    `Standard installation complexity`,
    `Regional pricing for ZIP ${input.zipCode}`,
  ];
  
  // Generate deterministic estimate ID (same inputs = same ID)
  // Hash input to create deterministic identifier
  const inputHash = hashInput(input);
  const estimateId = `est-${inputHash}`;
  
  // Generate unique submission ID for storage/tracking (non-deterministic)
  const submissionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    estimateId,
    input,
    costBreakdown: {
      equipment,
      labor,
      materials,
      total,
    },
    range,
    assumptions,
    createdAt: new Date().toISOString(),
    version: "v1",
    // Internal submission tracking (not used for routing or user-facing links)
    _submissionId: submissionId,
  };
}

// Hash input for deterministic ID generation
function hashInput(input: EstimateInput): string {
  const str = JSON.stringify(input);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 8);
}

