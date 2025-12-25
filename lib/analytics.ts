// Analytics tracking - non-PII, privacy-focused
// Tracks user actions and flow progression without personal data

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
}

/**
 * Track user events (non-PII only)
 * Examples: page_views, button_clicks, form_completions
 */
export async function trackEvent(
  event: string,
  properties?: Record<string, any>
): Promise<void> {
  try {
    // In production, send to analytics service (Google Analytics, Mixpanel, etc.)
    // For now, log to console and optionally save to file
    
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        // Remove any PII
        ...(properties?.email && { email: "***" }),
        ...(properties?.name && { name: "***" }),
      },
      timestamp: new Date().toISOString(),
    };

    // Log for development
    if (process.env.NODE_ENV !== "production") {
      console.log("[Analytics]", analyticsEvent);
    }

    // TODO: In production, send to analytics service
    // Example: await analytics.track(event, properties);
    
    // Save to file for local tracking (optional)
    // await saveAnalyticsEvent(analyticsEvent);
  } catch (error) {
    // Fail silently - analytics should never break the app
    console.error("Analytics error:", error);
  }
}

/**
 * Track page views
 */
export async function trackPageView(page: string): Promise<void> {
  await trackEvent("page_view", { page });
}

/**
 * Track estimate generation
 */
export async function trackEstimateGenerated(estimateId: string): Promise<void> {
  await trackEvent("estimate_generated", {
    estimateId,
    // Don't include user data
  });
}

/**
 * Track email sent
 */
export async function trackEmailSent(estimateId: string): Promise<void> {
  await trackEvent("estimate_email_sent", {
    estimateId,
  });
}

/**
 * Track PDF export
 */
export async function trackPDFExport(estimateId: string): Promise<void> {
  await trackEvent("estimate_pdf_exported", {
    estimateId,
  });
}

