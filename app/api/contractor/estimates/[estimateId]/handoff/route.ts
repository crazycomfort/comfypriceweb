// Estimate Handoff API
import { NextRequest, NextResponse } from "next/server";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { getEstimateById } from "@/lib/estimate-storage";
import { getContractorById } from "@/lib/storage";
import { getHandoff, setHandoff } from "@/lib/handoff-store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ estimateId: string }> }
) {
  try {
    const hasAccess = await hasContractorAccess();
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const contractorInfo = await getContractorInfo();
    if (!contractorInfo || !contractorInfo.companyId) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Only Owner Admin and Office can hand off estimates
    if (contractorInfo.role !== "owner_admin" && contractorInfo.role !== "office") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { estimateId } = await params;
    const body = await request.json();
    const { techId } = body;

    if (!techId) {
      return NextResponse.json(
        { error: "Tech ID is required" },
        { status: 400 }
      );
    }

    // Verify estimate exists and belongs to company
    const estimate = await getEstimateById(estimateId);
    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    if (estimate.companyId !== contractorInfo.companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Verify tech exists and belongs to same company
    const tech = await getContractorById(techId);
    if (!tech || tech.role !== "tech") {
      return NextResponse.json(
        { error: "Invalid tech" },
        { status: 400 }
      );
    }

    if (tech.companyId !== contractorInfo.companyId) {
      return NextResponse.json(
        { error: "Tech does not belong to your company" },
        { status: 403 }
      );
    }

    // Create handoff record
    const handoffData = {
      estimateId,
      companyId: contractorInfo.companyId,
      handedOffBy: contractorInfo.contractorId,
      handedOffTo: techId,
      handedOffAt: new Date().toISOString(),
      status: "handed_off" as const,
      lockedPricing: true,
      estimate: {
        ...estimate,
        selectedTier: (estimate as any).selectedTier || null,
        selectedAddOns: (estimate as any).selectedAddOns || [],
      },
    };

    setHandoff(estimateId, handoffData);

    return NextResponse.json({
      success: true,
      handoff: handoffData,
    });
  } catch (error) {
    console.error("Error creating handoff:", error);
    return NextResponse.json(
      { error: "Failed to hand off estimate" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ estimateId: string }> }
) {
  try {
    const hasAccess = await hasContractorAccess();
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const contractorInfo = await getContractorInfo();
    if (!contractorInfo || !contractorInfo.companyId) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const { estimateId } = await params;

    // Get handoff data
    const handoff = getHandoff(estimateId);

    if (!handoff) {
      return NextResponse.json({
        success: true,
        handoff: null,
      });
    }

    // Verify company access
    if (handoff.companyId !== contractorInfo.companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      handoff,
    });
  } catch (error) {
    console.error("Error fetching handoff:", error);
    return NextResponse.json(
      { error: "Failed to fetch handoff" },
      { status: 500 }
    );
  }
}

