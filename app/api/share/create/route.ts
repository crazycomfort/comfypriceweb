// Create share link API - Step 7
import { NextRequest, NextResponse } from "next/server";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { getContractorSession } from "@/lib/session";
import { getEstimateById } from "@/lib/estimate-storage";
import { createShareToken } from "@/lib/share-tokens";
import { canExecute, getExecutionContext } from "@/lib/execution-auth";
import { logEvent } from "@/lib/telemetry";

export async function POST(request: NextRequest) {
  // Feature flag check
  if (!isFeatureEnabled("estimateSharing")) {
    return NextResponse.json(
      { error: "Feature not enabled" },
      { status: 403 }
    );
  }

  try {
    const context = await getExecutionContext(request);
    
    const body = await request.json();
    const { estimateId, expiresInHours, singleUse } = body;

    if (!estimateId) {
      return NextResponse.json(
        { error: "estimateId is required" },
        { status: 400 }
      );
    }

    // Get estimate (company isolation enforced)
    const estimate = await getEstimateById(estimateId);
    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    // Authorization: homeowners can share their own estimates, contractors can share company estimates
    if (estimate.isHomeowner && !estimate.companyId) {
      // Homeowner estimate - allow sharing (no auth required for own estimate)
      // Company isolation not needed for homeowner estimates
    } else if (estimate.companyId) {
      // Contractor estimate - require contractor auth and company match
      const canShare = await canExecute("contractor:share_estimate", context);
      if (!canShare) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }
      // Company isolation: only company that owns estimate can share
      if (context.companyId !== estimate.companyId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }
    } else {
      // Unknown estimate type
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Create share token
    const token = await createShareToken(estimate.estimateId, estimate.version, {
      companyId: estimate.companyId || null, // Use estimate's companyId (null for homeowner estimates)
      expiresInHours,
      singleUse,
    });

    await logEvent("share_link_created", {
      estimateId,
      version: estimate.version,
      singleUse: !!singleUse,
    });

    return NextResponse.json({
      success: true,
      token: token.token,
      url: `/estimate/${token.token}`,
      expiresAt: token.expiresAt,
    });
  } catch (error) {
    console.error("Share link creation error:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}

