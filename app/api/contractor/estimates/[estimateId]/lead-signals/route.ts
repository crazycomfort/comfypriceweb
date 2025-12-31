// API endpoint to retrieve lead qualification signals for contractors
import { NextRequest, NextResponse } from "next/server";
import { getLeadSignalsForEstimate, getLeadQualityIndicators, getReadinessTier, getReadinessTierMetadata } from "@/lib/lead-qualification";
import { getContractorSession } from "@/lib/contractor-access";

export async function GET(
  request: NextRequest,
  { params }: { params: { estimateId: string } }
) {
  try {
    // Verify contractor is authenticated
    const session = await getContractorSession();
    if (!session || !session.contractorId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { estimateId } = params;
    if (!estimateId) {
      return NextResponse.json(
        { error: "Estimate ID is required" },
        { status: 400 }
      );
    }

    // Get lead qualification signals
    const signals = getLeadSignalsForEstimate(estimateId);
    
    if (!signals) {
      return NextResponse.json(
        { error: "Lead signals not found for this estimate" },
        { status: 404 }
      );
    }

    // Generate quality indicators (summary labels only)
    const indicators = getLeadQualityIndicators(signals);
    
    // Get readiness tier (contractor-facing, simple language)
    const readinessTier = getReadinessTier(signals);
    const readinessMetadata = getReadinessTierMetadata(readinessTier);

    return NextResponse.json({
      success: true,
      signals,
      indicators, // Simple labels for contractor view
      readinessTier, // "Exploring options" | "Actively planning" | "Ready for on-site evaluation"
      readinessMetadata, // Expected timeline and recommended action
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching lead signals:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead signals" },
      { status: 500 }
    );
  }
}

