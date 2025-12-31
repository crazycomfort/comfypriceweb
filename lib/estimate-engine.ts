// Estimate engine - Step 4
// Stubbed pricing logic (no real calculations, deterministic outputs)
import { getRegionalMultiplier, applyRegionalMultiplier } from "./regional-pricing";

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

export interface TierRange {
  good: { min: number; max: number };
  better: { min: number; max: number };
  best: { min: number; max: number };
}

export interface EstimateResult {
  estimateId: string;
  input: EstimateInput;
  tierRanges: TierRange;
  regionalBand?: {
    band: "low" | "average" | "high";
    label: string;
  };
  assumptions: string[];
  createdAt: string;
  version: string;
  _submissionId?: string; // Internal tracking only, not used for routing or user-facing links
}

// Deterministic estimate generation (same inputs -> same outputs)
export function generateEstimate(input: EstimateInput): EstimateResult {
  // Validate input to prevent runtime errors
  if (!input || typeof input !== "object") {
    throw new Error("Invalid input: input must be an object");
  }
  
  if (!input.squareFootage || typeof input.squareFootage !== "number" || input.squareFootage <= 0) {
    throw new Error("Invalid input: squareFootage must be a positive number");
  }
  
  if (!input.preferences || typeof input.preferences !== "object") {
    throw new Error("Invalid input: preferences must be an object");
  }
  
  // STUB: Deterministic tier-based pricing ranges
  // In production, this would use real pricing engine
  
  // Base pricing ranges for HVAC installs (realistic ranges)
  // These are adjusted based on home characteristics
  const sqft = input.squareFootage || 2000;
  const sqftMultiplier = Math.max(0.8, Math.min(2.0, sqft / 2000)); // Scale based on 2000 sqft baseline
  
  const systemType = input.preferences.systemType || "central-air";
  const systemTypeMultiplier = systemType === "heat-pump" ? 1.2 :
                               systemType === "dual-fuel" ? 1.3 : 1.0;
  
  const accessDifficulty = input.installationFactors?.accessDifficulty || "easy";
  const accessMultiplier = accessDifficulty === "difficult" ? 1.15 :
                          accessDifficulty === "average" ? 1.08 : 1.0;
  
  const homeAge = input.homeAge || "mid-age";
  const ageMultiplier = homeAge === "older" ? 1.1 : homeAge === "newer" ? 0.95 : 1.0;
  
  // Base ranges for Good/Better/Best tiers (realistic HVAC install ranges)
  const baseGoodMin = 5000;
  const baseGoodMax = 7500;
  const baseBetterMin = 7500;
  const baseBetterMax = 11000;
  const baseBestMin = 11000;
  const baseBestMax = 16000;
  
  // Apply home characteristic multipliers (before regional adjustment)
  const homeMultiplier = sqftMultiplier * systemTypeMultiplier * accessMultiplier * ageMultiplier;
  
  // Generate base tier ranges (before regional adjustment)
  const baseTierRanges: TierRange = {
    good: {
      min: Math.max(4000, Math.round(baseGoodMin * homeMultiplier)),
      max: Math.max(5000, Math.round(baseGoodMax * homeMultiplier)),
    },
    better: {
      min: Math.max(6000, Math.round(baseBetterMin * homeMultiplier)),
      max: Math.max(8000, Math.round(baseBetterMax * homeMultiplier)),
    },
    best: {
      min: Math.max(9000, Math.round(baseBestMin * homeMultiplier)),
      max: Math.max(12000, Math.round(baseBestMax * homeMultiplier)),
    },
  };
  
  // Ensure min < max for each tier
  baseTierRanges.good.max = Math.max(baseTierRanges.good.min + 500, baseTierRanges.good.max);
  baseTierRanges.better.min = Math.max(baseTierRanges.good.max + 500, baseTierRanges.better.min);
  baseTierRanges.better.max = Math.max(baseTierRanges.better.min + 500, baseTierRanges.better.max);
  baseTierRanges.best.min = Math.max(baseTierRanges.better.max + 500, baseTierRanges.best.min);
  baseTierRanges.best.max = Math.max(baseTierRanges.best.min + 500, baseTierRanges.best.max);
  
  // Apply regional pricing multiplier (ZIP code influences range, doesn't determine exact price)
  const regionalMultiplier = getRegionalMultiplier(input.zipCode || "");
  const tierRanges: TierRange = {
    good: applyRegionalMultiplier(
      baseTierRanges.good.min,
      baseTierRanges.good.max,
      regionalMultiplier.multiplier
    ),
    better: applyRegionalMultiplier(
      baseTierRanges.better.min,
      baseTierRanges.better.max,
      regionalMultiplier.multiplier
    ),
    best: applyRegionalMultiplier(
      baseTierRanges.best.min,
      baseTierRanges.best.max,
      regionalMultiplier.multiplier
    ),
  };
  
  // Final validation: ensure min < max for each tier after regional adjustment
  tierRanges.good.max = Math.max(tierRanges.good.min + 500, tierRanges.good.max);
  tierRanges.better.min = Math.max(tierRanges.good.max + 500, tierRanges.better.min);
  tierRanges.better.max = Math.max(tierRanges.better.min + 500, tierRanges.better.max);
  tierRanges.best.min = Math.max(tierRanges.better.max + 500, tierRanges.best.min);
  tierRanges.best.max = Math.max(tierRanges.best.min + 500, tierRanges.best.max);
  
  // Generate assumptions (safe string interpolation)
  const efficiencyLevel = input.preferences?.efficiencyLevel || "standard";
  const assumptions = [
    `Based on ${input.squareFootage || 0} sqft home`,
    `${efficiencyLevel} efficiency tier`,
    `Standard installation complexity`,
    `Regional pricing assumptions for ZIP ${input.zipCode || "unknown"}`,
  ];
  
  // Generate deterministic estimate ID (same inputs = same ID)
  // Hash input to create deterministic identifier
  let inputHash: string;
  try {
    inputHash = hashInput(input);
  } catch (hashError) {
    // Fallback hash if hashing fails
    inputHash = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }
  const estimateId = `est-${inputHash}`;
  
  // Generate unique submission ID for storage/tracking (non-deterministic)
  const submissionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Return validated result
  const result: EstimateResult = {
    estimateId,
    input,
    tierRanges,
    regionalBand: {
      band: regionalMultiplier.band,
      label: regionalMultiplier.label,
    },
    assumptions,
    createdAt: new Date().toISOString(),
    version: "v2",
    _submissionId: submissionId,
  };
  
  // Final validation
  if (!result.estimateId || !result.tierRanges) {
    throw new Error("Estimate generation produced invalid result");
  }
  
  return result;
}

// Hash input for deterministic ID generation
function hashInput(input: EstimateInput): string {
  try {
    // Create a stable string representation with only the fields we care about
    const stableInput = {
      zipCode: String(input.zipCode || "").trim(),
      squareFootage: Number(input.squareFootage) || 0,
      floors: Number(input.floors) || 1,
      homeAge: String(input.homeAge || "").trim(),
      efficiencyLevel: String(input.preferences?.efficiencyLevel || "").trim(),
      systemType: String(input.preferences?.systemType || "").trim(),
      smartFeatures: Boolean(input.preferences?.smartFeatures || false),
    };
    
    // Safe JSON stringify with error handling
    let str: string;
    try {
      str = JSON.stringify(stableInput);
    } catch (stringifyError) {
      // If stringify fails, create a simple string representation
      str = `${stableInput.zipCode}-${stableInput.squareFootage}-${stableInput.floors}-${stableInput.efficiencyLevel}-${stableInput.systemType}-${stableInput.smartFeatures}`;
    }
    
    // Safe hash calculation
    let hash = 0;
    const strLength = str.length;
    for (let i = 0; i < strLength; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to base36 and ensure minimum length
    const absHash = Math.abs(hash);
    if (absHash === 0) {
      // Fallback if hash is 0
      return `est${Date.now().toString(36).substring(0, 5)}`;
    }
    
    const hashStr = absHash.toString(36);
    // Ensure we return at least 8 characters, pad if needed
    return hashStr.length >= 8 ? hashStr.substring(0, 8) : hashStr.padEnd(8, '0');
  } catch (error) {
    // Ultimate fallback hash if anything fails
    const fallback = `fb${Date.now().toString(36).substring(0, 6)}${Math.random().toString(36).substring(2, 4)}`;
    return fallback;
  }
}

