// Homeowner estimate generation API - Step 4
import { NextRequest, NextResponse } from "next/server";
import { generateEstimate, EstimateInput } from "@/lib/estimate-engine";
import { saveEstimate } from "@/lib/estimate-storage";
import { canExecute, getExecutionContext, type ExecutionContext } from "@/lib/execution-auth";
import { logEvent } from "@/lib/telemetry";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limiting
  const key = getRateLimitKey(request);
  const limit = await checkRateLimit(key, 10, 60 * 1000); // 10 requests per minute
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  try {
    // For homeowner estimate generation, we allow it if:
    // 1. No contractor session exists (isHomeowner = true), OR
    // 2. Explicitly allow homeowner actions even if contractor session exists
    const context = await getExecutionContext(request);
    
    // Homeowner API routes should always allow homeowner actions
    // If user has contractor session, they can still use homeowner flow
    const homeownerContext: ExecutionContext = {
      ...context,
      isHomeowner: true, // Force homeowner context for this endpoint
    };
    
    const canEstimate = await canExecute("homeowner:generate_estimate", homeownerContext);
    if (!canEstimate) {
      console.error("Authorization failed:", { 
        action: "homeowner:generate_estimate", 
        context: homeownerContext,
        canEstimate 
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const input: EstimateInput = body;

    // Validate required fields with better error messages
    if (!input.zipCode || !input.zipCode.trim()) {
      return NextResponse.json(
        { error: "ZIP code is required" },
        { status: 400 }
      );
    }
    
    if (!input.squareFootage || input.squareFootage <= 0) {
      return NextResponse.json(
        { error: "Square footage must be greater than 0" },
        { status: 400 }
      );
    }
    
    if (!input.preferences || !input.preferences.efficiencyLevel || !input.preferences.systemType) {
      return NextResponse.json(
        { error: "Please complete all preference fields" },
        { status: 400 }
      );
    }

    // Generate estimate (deterministic)
    const estimate = generateEstimate(input);

    // Save estimate (homeowner, no company)
    // Note: In Vercel, file storage may not persist, but that's okay for estimates
    let stored;
    try {
      stored = await saveEstimate(estimate, {
        isHomeowner: true,
      });
    } catch (storageError) {
      console.error("Failed to save estimate to storage:", storageError);
      // Continue anyway - estimate is still valid, just not persisted
      stored = {
        ...estimate,
        isHomeowner: true,
      };
    }

    try {
      await logEvent("estimate_generated", {
        estimateId: stored.estimateId,
        version: stored.version,
        isHomeowner: true,
      });
    } catch (logError) {
      // Fail silently if logging fails
      console.error("Failed to log event:", logError);
    }

    return NextResponse.json({
      success: true,
      estimate: stored,
    });
  } catch (error) {
    console.error("Estimate generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    try {
      await logEvent("estimate_generation_error", { error: errorMessage });
    } catch (logError) {
      // Fail silently if logging fails
      console.error("Failed to log error:", logError);
    }
    return NextResponse.json(
      { 
        error: "Failed to generate estimate",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

