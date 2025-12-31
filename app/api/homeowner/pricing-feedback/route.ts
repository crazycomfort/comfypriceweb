// API endpoint for collecting real-world pricing feedback
// Used to compare estimates with actual contractor quotes
import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/telemetry";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limiting
  const key = getRateLimitKey(request);
  const limit = await checkRateLimit(key, 5, 60 * 1000); // 5 requests per minute
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      estimateId,
      actualQuote,
      contractorName,
      contractorLocation,
      quoteDate,
      notes,
      accuracy,
    } = body;

    // Validate required fields
    if (!estimateId) {
      return NextResponse.json(
        { error: "Estimate ID is required" },
        { status: 400 }
      );
    }

    if (!actualQuote || typeof actualQuote !== "number" || actualQuote <= 0) {
      return NextResponse.json(
        { error: "Valid actual quote amount is required" },
        { status: 400 }
      );
    }

    // Log the pricing feedback for analysis
    await logEvent("pricing_feedback_received", {
      estimateId,
      actualQuote,
      contractorName: contractorName || "anonymous",
      contractorLocation: contractorLocation || "unknown",
      quoteDate: quoteDate || new Date().toISOString(),
      accuracy: accuracy || "unknown",
      // Don't log notes as they may contain PII
    });

    // In a real application, you would:
    // 1. Save to database for analysis
    // 2. Calculate accuracy metrics
    // 3. Trigger alerts if estimates are consistently off
    // 4. Update pricing model based on feedback

    return NextResponse.json({
      success: true,
      message: "Thank you for your feedback! This helps us improve our estimates.",
    });
  } catch (error) {
    console.error("Pricing feedback error:", error);
    await logEvent("pricing_feedback_error", { error: "unknown" });
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}


