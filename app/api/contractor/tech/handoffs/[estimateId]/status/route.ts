// Tech Handoff Status Update API
import { NextRequest, NextResponse } from "next/server";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { getHandoff, updateHandoffStatus } from "@/lib/handoff-store";

export async function PATCH(
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

    // Only techs can update their handoff status
    if (contractorInfo.role !== "tech") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { estimateId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["in_progress", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'in_progress' or 'completed'" },
        { status: 400 }
      );
    }

    // Get handoff
    const handoff = getHandoff(estimateId);
    if (!handoff) {
      return NextResponse.json(
        { error: "Handoff not found" },
        { status: 404 }
      );
    }

    // Verify this handoff belongs to this tech
    if (handoff.handedOffTo !== contractorInfo.contractorId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update status
    const updated = updateHandoffStatus(estimateId, status);
    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update status" },
        { status: 500 }
      );
    }

    const updatedHandoff = getHandoff(estimateId);

    return NextResponse.json({
      success: true,
      handoff: updatedHandoff,
    });
  } catch (error) {
    console.error("Error updating handoff status:", error);
    return NextResponse.json(
      { error: "Failed to update handoff status" },
      { status: 500 }
    );
  }
}

