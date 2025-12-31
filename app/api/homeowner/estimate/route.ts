// Homeowner estimate generation API - Step 4
import { NextRequest, NextResponse } from "next/server";
import { generateEstimate, EstimateInput } from "@/lib/estimate-engine";
import { saveEstimate } from "@/lib/estimate-storage";
import { logEvent } from "@/lib/telemetry";
import { trackEstimateCompleted } from "@/lib/lead-qualification";
import { promises as fs } from "fs";
import path from "path";

// Debug logging utility - completely non-blocking
const DEBUG_LOG_FILE = path.join(process.cwd(), ".cursor", "debug.log");
function debugLog(location: string, message: string, data: any, hypothesisId?: string) {
  // Fire and forget - don't await, don't block
  (async () => {
    try {
      await fs.mkdir(path.dirname(DEBUG_LOG_FILE), { recursive: true });
      const logEntry = JSON.stringify({
        location,
        message,
        data,
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: hypothesisId || "unknown",
      }) + "\n";
      await fs.appendFile(DEBUG_LOG_FILE, logEntry, "utf-8");
    } catch (error) {
      // Fallback to console - always log to console.error so it's visible
      console.error("[DEBUG]", location, message, JSON.stringify(data, null, 2));
    }
  })().catch(() => {
    // Silently fail - logging should never break the app
    console.error("[DEBUG]", location, message, JSON.stringify(data, null, 2));
  });
}

export async function POST(request: NextRequest) {
  // #region agent log
  debugLog('api/homeowner/estimate/route.ts:7', 'POST handler called', {}, 'E');
  console.error('[DEBUG] POST handler called at', new Date().toISOString());
  // #endregion
  
  // Completely isolate all operations to prevent any error from breaking the flow
  try {
    // Step 1: Parse request body with full error handling
    let input: EstimateInput;
    try {
      const body = await request.json();
      // #region agent log
      debugLog('api/homeowner/estimate/route.ts:13', 'Request body parsed', {
        body,
        types: {
          zipCode: typeof body.zipCode,
          squareFootage: typeof body.squareFootage,
          floors: typeof body.floors,
          smartFeatures: typeof body.preferences?.smartFeatures,
        },
      }, 'A,B');
      console.error('[DEBUG] Request body parsed:', {
        hasZipCode: !!body.zipCode,
        squareFootage: body.squareFootage,
        floors: body.floors,
        smartFeatures: body.preferences?.smartFeatures,
        smartFeaturesType: typeof body.preferences?.smartFeatures,
      });
      // #endregion
      input = body as EstimateInput;
    } catch (parseError) {
      // #region agent log
      debugLog('api/homeowner/estimate/route.ts:15', 'Parse error', {
        error: String(parseError),
        stack: parseError instanceof Error ? parseError.stack : undefined,
      }, 'E');
      // #endregion
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { 
          error: "Invalid request data. Please try again.",
          details: process.env.NODE_ENV === "development" 
            ? (parseError instanceof Error ? parseError.message : "Unknown parse error")
            : undefined
        },
        { status: 400 }
      );
    }

    // Step 2: Validate all required fields
    const validationErrors: string[] = [];
    
    // #region agent log
    debugLog('api/homeowner/estimate/route.ts:28', 'Starting validation', {
      input,
      types: {
        zipCode: typeof input.zipCode,
        squareFootage: typeof input.squareFootage,
        floors: typeof input.floors,
        smartFeatures: typeof input.preferences?.smartFeatures,
      },
    }, 'A,B');
    // #endregion
    
    if (!input || typeof input !== "object") {
      validationErrors.push("Invalid input format");
    } else {
      if (!input.zipCode || typeof input.zipCode !== "string" || !input.zipCode.trim()) {
        validationErrors.push("ZIP code is required");
      }
      
      if (!input.squareFootage || typeof input.squareFootage !== "number" || input.squareFootage <= 0) {
        validationErrors.push("Square footage must be a positive number");
      }
      
      if (!input.floors || typeof input.floors !== "number" || input.floors < 1) {
        validationErrors.push("Number of floors is required (minimum 1)");
      }
      
      if (!input.homeAge || typeof input.homeAge !== "string" || !input.homeAge.trim()) {
        validationErrors.push("Home age is required");
      }
      
      if (!input.preferences || typeof input.preferences !== "object") {
        validationErrors.push("Preferences are required");
      } else {
        if (!input.preferences.efficiencyLevel || typeof input.preferences.efficiencyLevel !== "string" || !input.preferences.efficiencyLevel.trim()) {
          validationErrors.push("Efficiency level is required");
        }
        if (!input.preferences.systemType || typeof input.preferences.systemType !== "string" || !input.preferences.systemType.trim()) {
          validationErrors.push("System type is required");
        }
        // Handle smartFeatures - normalize to boolean
        const smartFeaturesValue = input.preferences.smartFeatures;
        if (smartFeaturesValue === undefined || smartFeaturesValue === null) {
          validationErrors.push("Smart features preference is required");
        } else {
          // Normalize to boolean - handle string "true"/"false" or actual boolean
          if (typeof smartFeaturesValue === "string") {
            if (smartFeaturesValue === "true" || smartFeaturesValue === "yes") {
              input.preferences.smartFeatures = true;
            } else if (smartFeaturesValue === "false" || smartFeaturesValue === "no") {
              input.preferences.smartFeatures = false;
            } else {
              validationErrors.push("Smart features preference must be true or false");
            }
          } else if (typeof smartFeaturesValue !== "boolean") {
            // Try to convert to boolean
            input.preferences.smartFeatures = Boolean(smartFeaturesValue);
          }
          // If it's already a boolean, leave it as is
        }
      }
    }
    
    // #region agent log
    debugLog('api/homeowner/estimate/route.ts:65', 'Validation complete', {
      validationErrors,
      errorCount: validationErrors.length,
    }, 'A,B');
    console.error('[DEBUG] Validation complete:', {
      errorCount: validationErrors.length,
      errors: validationErrors,
    });
    // #endregion
    
    if (validationErrors.length > 0) {
      console.error("Validation errors:", validationErrors, "Input:", input);
      return NextResponse.json(
        { 
          error: "Please complete all required fields",
          validationErrors: validationErrors,
          details: process.env.NODE_ENV === "development" ? "Check console for full input data" : undefined
        },
        { status: 400 }
      );
    }

    // Step 3: Generate estimate - this should never fail if validation passed
    let estimate;
    try {
      // #region agent log
      debugLog('api/homeowner/estimate/route.ts:79', 'Calling generateEstimate', { input }, 'C');
      console.error('[DEBUG] Calling generateEstimate');
      // #endregion
      estimate = generateEstimate(input);
      
      // #region agent log
      debugLog('api/homeowner/estimate/route.ts:80', 'generateEstimate returned', {
        hasEstimate: !!estimate,
        estimateId: estimate?.estimateId,
        hasTierRanges: !!estimate?.tierRanges,
      }, 'C');
      console.error('[DEBUG] generateEstimate returned:', {
        hasEstimate: !!estimate,
        estimateId: estimate?.estimateId,
        hasTierRanges: !!estimate?.tierRanges,
      });
      // #endregion
      
      // Verify estimate was generated correctly
      if (!estimate || !estimate.estimateId || !estimate.tierRanges) {
        // #region agent log
        debugLog('api/homeowner/estimate/route.ts:83', 'Invalid estimate structure', { 
          hasEstimate: !!estimate,
          hasEstimateId: !!estimate?.estimateId,
          hasTierRanges: !!estimate?.tierRanges,
          estimateKeys: estimate ? Object.keys(estimate) : []
        }, 'C');
        console.error('[DEBUG] Invalid estimate structure:', {
          hasEstimate: !!estimate,
          hasEstimateId: !!estimate?.estimateId,
          hasTierRanges: !!estimate?.tierRanges,
        });
        // #endregion
        throw new Error("Estimate generation returned invalid result");
      }
    } catch (genError) {
      // #region agent log
      debugLog('api/homeowner/estimate/route.ts:86', 'Estimate generation failed', {
        error: String(genError),
        message: genError instanceof Error ? genError.message : 'unknown',
        stack: genError instanceof Error ? genError.stack : undefined,
      }, 'C');
      console.error('[DEBUG] Estimate generation failed:', genError);
      // #endregion
      console.error("Estimate generation failed:", genError);
      const errorMsg = genError instanceof Error ? genError.message : "Unknown generation error";
      return NextResponse.json(
        { 
          error: "Failed to generate estimate",
          details: process.env.NODE_ENV === "development" ? errorMsg : "Please try again or contact support."
        },
        { status: 500 }
      );
    }

    // Step 4: Save estimate (non-critical - continue even if this fails)
    let stored = estimate;
    try {
      const saved = await saveEstimate(estimate, {
        isHomeowner: true,
      });
      if (saved) {
        stored = saved;
      }
    } catch (storageError) {
      // Storage is non-critical - estimate is still valid
      console.warn("Estimate storage failed (non-critical):", storageError);
      // Add isHomeowner flag manually
      stored = {
        ...estimate,
        isHomeowner: true,
      } as any;
    }

    // Step 5: Log event (non-critical - continue even if this fails)
    try {
      await logEvent("estimate_generated", {
        estimateId: stored.estimateId,
        version: stored.version || "v1",
        isHomeowner: true,
      });
    } catch (logError) {
      // Logging is non-critical
      console.warn("Event logging failed (non-critical):", logError);
    }

    // Step 6: Validate response structure before returning
    if (!stored.estimateId || !stored.tierRanges || !Array.isArray(stored.assumptions)) {
      console.error("Invalid estimate structure:", stored);
      return NextResponse.json(
        { 
          error: "Estimate generation produced invalid structure",
          details: process.env.NODE_ENV === "development" ? "Check server logs" : undefined
        },
        { status: 500 }
      );
    }

    // Step 7: Track estimate completion for lead qualification
    try {
      trackEstimateCompleted(stored.estimateId);
    } catch (error) {
      // Fail silently - tracking should never break the app
      console.error("Lead qualification tracking error (non-critical):", error);
    }

    // Step 8: Return success response
    // #region agent log
    debugLog('api/homeowner/estimate/route.ts:142', 'Returning success response', {
      hasEstimate: !!stored,
      estimateId: stored?.estimateId,
    }, 'D');
    console.error('[DEBUG] Returning success response:', {
      estimateId: stored?.estimateId,
    });
    // #endregion
    return NextResponse.json({
      success: true,
      estimate: stored,
    }, { status: 200 });

  } catch (error) {
    // Catch-all for any unexpected errors
    // #region agent log
    debugLog('api/homeowner/estimate/route.ts:147', 'Unexpected error in catch-all', {
      error: String(error),
      message: error instanceof Error ? error.message : 'unknown',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'unknown',
    }, 'A,B,C,D,E');
    console.error('[DEBUG] Unexpected error in catch-all:', error);
    // #endregion
    console.error("Unexpected error in estimate generation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("Full error details:", {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : "Unknown",
    });
    
    // Try to log the error (but don't fail if this fails)
    try {
      await logEvent("estimate_generation_error", { 
        error: errorMessage.substring(0, 200),
      });
    } catch (logError) {
      console.error("Failed to log error event:", logError);
    }
    
    return NextResponse.json(
      { 
        error: "An unexpected error occurred while generating your estimate",
        details: process.env.NODE_ENV === "development" 
          ? `${errorMessage}${errorStack ? `\n\nStack trace:\n${errorStack}` : ""}`
          : "Please try again. If the problem persists, please contact support."
      },
      { status: 500 }
    );
  }
}
