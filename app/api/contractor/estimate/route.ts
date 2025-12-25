// Contractor estimate generation API - Step 5
import { NextRequest, NextResponse } from "next/server";
import { getContractorSession } from "@/lib/session";
import { generateEstimate, EstimateInput } from "@/lib/estimate-engine";
import { saveEstimate } from "@/lib/estimate-storage";
import { canExecute, getExecutionContext } from "@/lib/execution-auth";
import { logEvent } from "@/lib/telemetry";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limiting
  const key = getRateLimitKey(request);
  const limit = await checkRateLimit(key, 20, 60 * 1000); // 20 requests per minute
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  try {
    const context = await getExecutionContext(request);
    
    // Execution authorization
    const canEstimate = await canExecute("contractor:generate_estimate", context);
    if (!canEstimate) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const session = await getContractorSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const input: EstimateInput = body;

    // Validate required fields
    if (!input.zipCode || !input.squareFootage || !input.preferences) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate estimate (deterministic)
    const estimate = generateEstimate(input);

    // Save estimate with company isolation
    const stored = await saveEstimate(estimate, {
      companyId: session.companyId,
      contractorId: session.contractorId,
      isHomeowner: false,
    });

    await logEvent("estimate_generated", {
      estimateId: stored.estimateId,
      version: stored.version,
      companyId: session.companyId,
      isHomeowner: false,
    });

    return NextResponse.json({
      success: true,
      estimate: stored,
    });
  } catch (error) {
    console.error("Contractor estimate generation error:", error);
    await logEvent("estimate_generation_error", { error: "unknown" });
    return NextResponse.json(
      { error: "Failed to generate estimate" },
      { status: 500 }
    );
  }
}

