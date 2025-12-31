// Lead qualification tracking - internal signals for contractor lead quality
// Non-blocking, no UI changes, used for contractor-facing lead quality indicators

export interface LeadQualificationSignals {
  estimateId: string;
  // Completion signals
  estimateCompleted: boolean;
  estimateCompletedAt?: string;
  
  // Engagement signals
  viewedComparison: boolean;
  viewedComparisonAt?: string;
  viewedFinancing: boolean;
  viewedFinancingAt?: string;
  
  // Time-based signals
  resultsPageLoadTime?: number; // milliseconds
  timeSpentOnResults?: number; // seconds
  resultsPageFirstViewAt?: string;
  resultsPageLastViewAt?: string;
  
  // Action signals
  savedEstimate: boolean;
  savedEstimateAt?: string;
  sharedEstimate: boolean;
  sharedEstimateAt?: string;
  
  // Additional readiness signals (new)
  selectedTier?: "good" | "better" | "best";
  scrollDepth?: number; // 0-100, percentage of page scrolled
  nextStepsSectionViewed?: boolean;
  nextStepsSectionViewedAt?: string;
  
  // Calculated quality score (0-100) - internal only
  qualityScore?: number;
  // Calculated readiness score (0-100) - internal only
  readinessScore?: number;
}

// In-memory store for lead qualification signals
// In production, this should be stored in a database
const leadSignalsStore = new Map<string, LeadQualificationSignals>();

/**
 * Initialize or get lead qualification signals for an estimate
 */
export function getLeadSignals(estimateId: string): LeadQualificationSignals {
  if (!leadSignalsStore.has(estimateId)) {
    leadSignalsStore.set(estimateId, {
      estimateId,
      estimateCompleted: false,
      viewedComparison: false,
      viewedFinancing: false,
      savedEstimate: false,
      sharedEstimate: false,
    });
  }
  return leadSignalsStore.get(estimateId)!;
}

/**
 * Update lead qualification signals (non-blocking)
 */
export function updateLeadSignals(
  estimateId: string,
  updates: Partial<LeadQualificationSignals>
): void {
  try {
    const signals = getLeadSignals(estimateId);
    const merged = {
      ...signals,
      ...updates,
    };
    const updated: LeadQualificationSignals = {
      ...merged,
      // Calculate scores when updating (internal only)
      qualityScore: calculateQualityScore(merged),
      readinessScore: calculateReadinessScore(merged),
    };
    leadSignalsStore.set(estimateId, updated);
    
    // In production, persist to database (non-blocking)
    // This is fire-and-forget
    persistLeadSignals(updated).catch(() => {
      // Silently fail - tracking should never break the app
    });
  } catch (error) {
    // Silently fail - tracking should never break the app
    console.error("Lead qualification tracking error:", error);
  }
}

/**
 * Mark estimate as completed
 */
export function trackEstimateCompleted(estimateId: string): void {
  updateLeadSignals(estimateId, {
    estimateCompleted: true,
    estimateCompletedAt: new Date().toISOString(),
  });
}

/**
 * Track comparison section view
 */
export function trackComparisonView(estimateId: string): void {
  const signals = getLeadSignals(estimateId);
  if (!signals.viewedComparison) {
    updateLeadSignals(estimateId, {
      viewedComparison: true,
      viewedComparisonAt: new Date().toISOString(),
    });
  }
}

/**
 * Track financing section view
 */
export function trackFinancingView(estimateId: string): void {
  const signals = getLeadSignals(estimateId);
  if (!signals.viewedFinancing) {
    updateLeadSignals(estimateId, {
      viewedFinancing: true,
      viewedFinancingAt: new Date().toISOString(),
    });
  }
}

/**
 * Track time spent on results page
 */
export function trackResultsPageTime(
  estimateId: string,
  timeSpentSeconds: number
): void {
  updateLeadSignals(estimateId, {
    timeSpentOnResults: timeSpentSeconds,
    resultsPageLastViewAt: new Date().toISOString(),
  });
}

/**
 * Track results page load
 */
export function trackResultsPageLoad(
  estimateId: string,
  loadTimeMs: number
): void {
  const signals = getLeadSignals(estimateId);
  updateLeadSignals(estimateId, {
    resultsPageLoadTime: loadTimeMs,
    resultsPageFirstViewAt: signals.resultsPageFirstViewAt || new Date().toISOString(),
    resultsPageLastViewAt: new Date().toISOString(),
  });
}

/**
 * Track save action
 */
export function trackSave(estimateId: string): void {
  const signals = getLeadSignals(estimateId);
  if (!signals.savedEstimate) {
    updateLeadSignals(estimateId, {
      savedEstimate: true,
      savedEstimateAt: new Date().toISOString(),
    });
  }
}

/**
 * Track share action
 */
export function trackShare(estimateId: string): void {
  const signals = getLeadSignals(estimateId);
  if (!signals.sharedEstimate) {
    updateLeadSignals(estimateId, {
      sharedEstimate: true,
      sharedEstimateAt: new Date().toISOString(),
    });
  }
}

/**
 * Calculate quality score (0-100) - internal only
 * Higher score = better qualified lead
 */
function calculateQualityScore(signals: LeadQualificationSignals): number {
  let score = 0;
  
  // Base completion (required)
  if (signals.estimateCompleted) {
    score += 30;
  }
  
  // Engagement signals
  if (signals.viewedComparison) {
    score += 20;
  }
  if (signals.viewedFinancing) {
    score += 15;
  }
  
  // Time-based signals
  if (signals.timeSpentOnResults) {
    if (signals.timeSpentOnResults >= 60) {
      score += 15; // Spent 1+ minutes
    } else if (signals.timeSpentOnResults >= 30) {
      score += 10; // Spent 30+ seconds
    } else if (signals.timeSpentOnResults >= 15) {
      score += 5; // Spent 15+ seconds
    }
  }
  
  // Action signals
  if (signals.savedEstimate) {
    score += 10;
  }
  if (signals.sharedEstimate) {
    score += 10; // Sharing indicates serious consideration
  }
  
  return Math.min(100, score);
}

/**
 * Calculate readiness score (0-100) - internal only
 * Based on behavioral signals that indicate readiness for on-site evaluation
 */
function calculateReadinessScore(signals: LeadQualificationSignals): number {
  let score = 0;
  
  // Base: Estimate completed (required)
  if (!signals.estimateCompleted) {
    return 0; // Must complete estimate to be ready
  }
  score += 20;
  
  // Completion of all steps (inferred from estimate completion)
  score += 10;
  
  // Time spent reviewing options
  if (signals.timeSpentOnResults) {
    if (signals.timeSpentOnResults >= 60) {
      score += 15; // Spent 1+ minutes
    } else if (signals.timeSpentOnResults >= 30) {
      score += 10; // Spent 30+ seconds
    } else if (signals.timeSpentOnResults >= 15) {
      score += 5; // Spent 15+ seconds
    }
  }
  
  // Interaction with comparison tables
  if (signals.viewedComparison) {
    score += 15;
  }
  
  // Use of share link or save
  if (signals.savedEstimate || signals.sharedEstimate) {
    score += 15; // Indicates serious consideration
  }
  
  // Review of financing section
  if (signals.viewedFinancing) {
    score += 10;
  }
  
  // Selection of Good / Better / Best (tier selection)
  if (signals.selectedTier) {
    score += 10; // Has made a preference decision
  }
  
  // Scroll depth on "Next Steps" section
  if (signals.nextStepsSectionViewed) {
    score += 10; // Viewed next steps section
  }
  if (signals.scrollDepth && signals.scrollDepth >= 75) {
    score += 5; // Scrolled deep into page
  }
  
  return Math.min(100, score);
}

/**
 * Get lead quality score for an estimate
 */
export function getLeadQualityScore(estimateId: string): number {
  const signals = getLeadSignals(estimateId);
  return signals.qualityScore || calculateQualityScore(signals);
}

/**
 * Get all lead signals for an estimate (for contractor view)
 */
export function getLeadSignalsForEstimate(estimateId: string): LeadQualificationSignals | null {
  return leadSignalsStore.get(estimateId) || null;
}

/**
 * Lead quality indicator labels (summary only, no behavioral data)
 */
export type LeadQualityIndicator = 
  | "High intent"
  | "Reviewed options"
  | "Viewed financing"
  | "Saved/shared estimate";

/**
 * Generate lead quality indicators from signals
 * Returns simple labels only - no scores or behavioral details
 */
export function getLeadQualityIndicators(signals: LeadQualificationSignals | null): LeadQualityIndicator[] {
  if (!signals) {
    return [];
  }

  const indicators: LeadQualityIndicator[] = [];

  // High intent: multiple engagement signals
  const engagementCount = 
    (signals.viewedComparison ? 1 : 0) +
    (signals.viewedFinancing ? 1 : 0) +
    (signals.savedEstimate ? 1 : 0) +
    (signals.sharedEstimate ? 1 : 0) +
    (signals.timeSpentOnResults && signals.timeSpentOnResults >= 60 ? 1 : 0);

  if (engagementCount >= 3) {
    indicators.push("High intent");
  }

  // Reviewed options
  if (signals.viewedComparison) {
    indicators.push("Reviewed options");
  }

  // Viewed financing
  if (signals.viewedFinancing) {
    indicators.push("Viewed financing");
  }

  // Saved/shared estimate
  if (signals.savedEstimate || signals.sharedEstimate) {
    indicators.push("Saved/shared estimate");
  }

  return indicators;
}

/**
 * Readiness Tier - contractor-visible language, not scores
 */
export type ReadinessTier = 
  | "Exploring options"
  | "Actively planning"
  | "Ready for on-site evaluation";

/**
 * Get readiness tier from signals (contractor-facing, simple language)
 * Homeowners never see this
 */
export function getReadinessTier(signals: LeadQualificationSignals | null): ReadinessTier {
  if (!signals || !signals.estimateCompleted) {
    return "Exploring options";
  }
  
  const readinessScore = signals.readinessScore || calculateReadinessScore(signals);
  
  // Tier thresholds (internal only)
  if (readinessScore >= 70) {
    return "Ready for on-site evaluation";
  } else if (readinessScore >= 40) {
    return "Actively planning";
  } else {
    return "Exploring options";
  }
}

/**
 * Get minimum engagement threshold for appointment request
 * Returns true if homeowner has sufficient engagement to request on-site evaluation
 */
export function meetsMinimumEngagementThreshold(signals: LeadQualificationSignals | null): boolean {
  if (!signals || !signals.estimateCompleted) {
    return false; // Must complete estimate
  }
  
  const readinessScore = signals.readinessScore || (signals ? calculateReadinessScore(signals) : 0);
  
  // Minimum threshold: 40 points (Actively planning tier)
  // This filters out curiosity clicks and half-completed estimates
  return readinessScore >= 40;
}

/**
 * Track tier selection (Good/Better/Best)
 */
export function trackTierSelection(estimateId: string, tier: "good" | "better" | "best"): void {
  updateLeadSignals(estimateId, {
    selectedTier: tier,
  });
}

/**
 * Track scroll depth (percentage of page scrolled)
 */
export function trackScrollDepth(estimateId: string, depth: number): void {
  const signals = getLeadSignals(estimateId);
  // Only update if depth increased (don't overwrite with lower values)
  if (!signals.scrollDepth || depth > signals.scrollDepth) {
    updateLeadSignals(estimateId, {
      scrollDepth: Math.min(100, Math.max(0, depth)),
    });
  }
}

/**
 * Track next steps section view
 */
export function trackNextStepsView(estimateId: string): void {
  const signals = getLeadSignals(estimateId);
  if (!signals.nextStepsSectionViewed) {
    updateLeadSignals(estimateId, {
      nextStepsSectionViewed: true,
      nextStepsSectionViewedAt: new Date().toISOString(),
    });
  }
}

/**
 * Get readiness tier metadata for contractors
 * Includes expected close timeline and recommended action
 */
export function getReadinessTierMetadata(tier: ReadinessTier): {
  expectedTimeline: string;
  recommendedAction: string;
} {
  switch (tier) {
    case "Ready for on-site evaluation":
      return {
        expectedTimeline: "Within 1-2 weeks",
        recommendedAction: "Schedule on-site evaluation promptly",
      };
    case "Actively planning":
      return {
        expectedTimeline: "Within 1-3 months",
        recommendedAction: "Engage with educational follow-up, answer questions",
      };
    case "Exploring options":
      return {
        expectedTimeline: "3+ months or exploratory",
        recommendedAction: "Provide educational resources, no pressure",
      };
  }
}

/**
 * Persist lead signals to storage (non-blocking, fire-and-forget)
 * In production, this would save to a database
 */
async function persistLeadSignals(signals: LeadQualificationSignals): Promise<void> {
  // TODO: In production, save to database
  // For now, this is a no-op as we're using in-memory storage
  // In a real implementation:
  // await db.leadSignals.upsert({
  //   where: { estimateId: signals.estimateId },
  //   update: signals,
  //   create: signals,
  // });
}

