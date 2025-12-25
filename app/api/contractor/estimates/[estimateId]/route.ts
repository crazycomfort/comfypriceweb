// Contractor estimate detail API
import { NextRequest, NextResponse } from "next/server";
import { getContractorSession } from "@/lib/session";
import { getEstimateById } from "@/lib/estimate-storage";
import { canExecute, getExecutionContext } from "@/lib/execution-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { estimateId: string } }
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

    if (!session.companyId) {
      return NextResponse.json(
        { error: "Company ID required" },
        { status: 400 }
      );
    }

    const estimateId = params.estimateId;
    const estimate = await getEstimateById(estimateId);

    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    // Verify the estimate belongs to the contractor's company
    if (estimate.companyId !== session.companyId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      estimate,
    });
  } catch (error) {
    console.error("Error fetching estimate:", error);
    return NextResponse.json(
      { error: "Failed to fetch estimate" },
      { status: 500 }
    );
  }
}

