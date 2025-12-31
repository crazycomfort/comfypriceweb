// Shared custom pricing store (in production, use database)
// This allows contractors to set custom final pricing outside automated ranges

interface CustomPricingData {
  estimateId: string;
  companyId: string;
  customPricing: {
    good?: { min: number; max: number };
    better?: { min: number; max: number };
    best?: { min: number; max: number };
  } | null;
  pricingVarianceNotes: string | null;
  updatedAt: string;
  updatedBy: string;
}

const customPricingStore = new Map<string, CustomPricingData>();

export function getCustomPricing(estimateId: string): CustomPricingData | null {
  return customPricingStore.get(estimateId) || null;
}

export function setCustomPricing(estimateId: string, data: CustomPricingData): void {
  customPricingStore.set(estimateId, data);
}

export function deleteCustomPricing(estimateId: string): void {
  customPricingStore.delete(estimateId);
}



