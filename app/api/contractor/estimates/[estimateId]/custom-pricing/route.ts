// Contractor Custom Pricing API
import { NextRequest, NextResponse } from "next/server";
import { getContractorSession } from "@/lib/session";
import { getEstimateById } from "@/lib/estimate-storage";
import { canExecute, getExecutionContext } from "@/lib/execution-auth";
import { getCustomPricing, setCustomPricing, deleteCustomPricing } from "@/lib/custom-pricing-store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ estimateId: string }> }
) {
  try {
    const context = await getExecutionContext(request);
    
    // Execution authorization
    const canEdit = await canExecute("contractor:edit_estimates", context);
    if (!canEdit) {
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

    if (!session.companyId) {
      return NextResponse.json(
        { error: "Company ID required" },
        { status: 400 }
      );
    }

    const { estimateId } = await params;
    const body = await request.json();
    const { customPricing, pricingVarianceNotes } = body;

    // Verify estimate exists and belongs to company
    const estimate = await getEstimateById(estimateId);
    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    if (estimate.companyId !== session.companyId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Validate custom pricing structure if provided
    if (customPricing) {
      const validTiers = ["good", "better", "best"];
      for (const tier of Object.keys(customPricing)) {
        if (!validTiers.includes(tier)) {
          return NextResponse.json(
            { error: `Invalid tier: ${tier}` },
            { status: 400 }
          );
        }
        const tierPricing = customPricing[tier];
        if (tierPricing && (typeof tierPricing.min !== "number" || typeof tierPricing.max !== "number")) {
          return NextResponse.json(
            { error: `Invalid pricing for tier ${tier}` },
            { status: 400 }
          );
        }
        if (tierPricing && tierPricing.min > tierPricing.max) {
          return NextResponse.json(
            { error: `Min price must be less than max price for tier ${tier}` },
            { status: 400 }
          );
        }
      }
    }

    // Save custom pricing (contractors have full pricing authority)
    // If customPricing is empty/null, delete it (contractor wants to use automated ranges)
    if (!customPricing || Object.keys(customPricing).length === 0) {
      deleteCustomPricing(estimateId);
    } else {
      const customPricingData = {
        estimateId,
        companyId: session.companyId,
        customPricing: customPricing,
        pricingVarianceNotes: pricingVarianceNotes || null,
        updatedAt: new Date().toISOString(),
        updatedBy: session.contractorId,
      };
      setCustomPricing(estimateId, customPricingData);
    }

    // Return updated estimate with custom pricing
    const updatedEstimate = {
      ...estimate,
      customPricing: (!customPricing || Object.keys(customPricing).length === 0) ? null : customPricing,
      pricingVarianceNotes: pricingVarianceNotes || null,
    };

    return NextResponse.json({
      success: true,
      estimate: updatedEstimate,
    });
  } catch (error) {
    console.error("Error saving custom pricing:", error);
    return NextResponse.json(
      { error: "Failed to save custom pricing" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ estimateId: string }> }
) {
  try {
    const context = await getExecutionContext(request);
    
    // Execution authorization
    const canView = await canExecute("contractor:view_estimates", context);
    if (!canView) {
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

    const { estimateId } = await params;

    // Get custom pricing if it exists
    const customPricingData = getCustomPricing(estimateId);

    if (!customPricingData) {
      return NextResponse.json({
        success: true,
        customPricing: null,
        pricingVarianceNotes: null,
      });
    }

    // Verify company access
    if (customPricingData.companyId !== session.companyId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      customPricing: customPricingData.customPricing,
      pricingVarianceNotes: customPricingData.pricingVarianceNotes,
    });
  } catch (error) {
    console.error("Error fetching custom pricing:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom pricing" },
      { status: 500 }
    );
  }
}

