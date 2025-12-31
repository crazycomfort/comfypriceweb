// Contractor estimates list API
import { NextRequest, NextResponse } from "next/server";
import { getContractorSession } from "@/lib/session";
import { getEstimatesByCompany } from "@/lib/estimate-storage";
import { canExecute, getExecutionContext } from "@/lib/execution-auth";

export async function GET(request: NextRequest) {
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

    // Get estimates for the company
    const estimates = await getEstimatesByCompany(session.companyId);

    // Sort by most recent first
    const sortedEstimates = estimates.sort((a, b) => {
      const dateA = new Date(a.estimateId).getTime();
      const dateB = new Date(b.estimateId).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      estimates: sortedEstimates,
      count: sortedEstimates.length,
    });
  } catch (error) {
    console.error("Error fetching contractor estimates:", error);
    return NextResponse.json(
      { error: "Failed to fetch estimates" },
      { status: 500 }
    );
  }
}


