// Regional pricing bands - Maps ZIP codes to cost bands
// ZIP code never directly determines final price, only influences the range

export type CostBand = "low" | "average" | "high";

export interface RegionalMultiplier {
  band: CostBand;
  multiplier: number;
  label: string;
}

// Regional cost band multipliers
// These adjust pricing ranges based on regional factors (labor rates, material costs, market conditions)
// Final pricing is still confirmed by a licensed contractor after review
const REGIONAL_MULTIPLIERS: Record<CostBand, RegionalMultiplier> = {
  low: {
    band: "low",
    multiplier: 0.85, // 15% below average
    label: "Lower cost region",
  },
  average: {
    band: "average",
    multiplier: 1.0, // Baseline
    label: "Average cost region",
  },
  high: {
    band: "high",
    multiplier: 1.25, // 25% above average
    label: "Higher cost region",
  },
};

/**
 * Maps ZIP code to a regional cost band
 * This is a simplified mapping - in production, this would use real regional data
 * ZIP code never directly determines final price, only influences the range
 */
export function getCostBandForZip(zipCode: string): CostBand {
  if (!zipCode || zipCode.length < 5) {
    return "average"; // Default to average if ZIP is invalid
  }

  // Extract first 3 digits of ZIP for regional grouping
  const zipPrefix = zipCode.substring(0, 3);
  const zipNum = parseInt(zipPrefix, 10);

  // Simplified regional mapping based on ZIP prefixes
  // In production, this would use actual regional cost data
  // Low cost regions (rural, lower cost of living areas)
  if (
    (zipNum >= 200 && zipNum < 300) || // Some regions
    (zipNum >= 400 && zipNum < 500) ||
    (zipNum >= 600 && zipNum < 700) ||
    (zipNum >= 800 && zipNum < 850)
  ) {
    return "low";
  }

  // High cost regions (major metros, high cost of living)
  if (
    (zipNum >= 900 && zipNum < 950) || // California
    (zipNum >= 100 && zipNum < 150) || // NYC area
    (zipNum >= 200 && zipNum < 250) || // DC area
    (zipNum >= 9000 && zipNum < 10000) // Some high-cost areas
  ) {
    return "high";
  }

  // Default to average for most regions
  return "average";
}

/**
 * Gets the regional multiplier for a ZIP code
 * This multiplier adjusts pricing ranges, not exact prices
 */
export function getRegionalMultiplier(zipCode: string): RegionalMultiplier {
  const band = getCostBandForZip(zipCode);
  return REGIONAL_MULTIPLIERS[band];
}

/**
 * Applies regional multiplier to a price range
 * Returns adjusted min and max values
 */
export function applyRegionalMultiplier(
  min: number,
  max: number,
  multiplier: number
): { min: number; max: number } {
  return {
    min: Math.max(3000, Math.round(min * multiplier)),
    max: Math.max(4000, Math.round(max * multiplier)),
  };
}

/**
 * Gets explanation text for why pricing varies by region
 */
export function getRegionalPricingExplanation(band: CostBand): string {
  switch (band) {
    case "low":
      return "This region typically has lower labor rates and material costs, which can reduce installation costs.";
    case "high":
      return "This region typically has higher labor rates, material costs, and permit fees, which can increase installation costs.";
    case "average":
      return "This region has average labor rates and material costs compared to national averages.";
    default:
      return "Regional factors like labor rates, material costs, and local market conditions influence pricing.";
  }
}



