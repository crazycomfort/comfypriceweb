// Feature flags - all OFF by default
// Set to true for testing
export const featureFlags = {
  contractorFlow: true,      // Enable for contractor flow testing
  educationPage: true,       // Enable for education page testing
  estimateSharing: true,     // Enable for share links testing
  detailedEstimate: false,
  smartFeatures: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
