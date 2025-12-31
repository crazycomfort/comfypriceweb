// Tech Handoffs API - Get all handoffs for current tech
import { NextRequest, NextResponse } from "next/server";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { getAllHandoffsForTech } from "@/lib/handoff-store";

export async function GET(request: NextRequest) {
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

    // Only techs can access their handoffs
    if (contractorInfo.role !== "tech") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get all handoffs for this tech
    const allHandoffs = getAllHandoffsForTech(contractorInfo.contractorId, contractorInfo.companyId);

    // Sort by handed off date (newest first)
    allHandoffs.sort((a, b) => 
      new Date(b.handedOffAt).getTime() - new Date(a.handedOffAt).getTime()
    );

    return NextResponse.json({
      success: true,
      handoffs: allHandoffs,
    });
  } catch (error) {
    console.error("Error fetching handoffs:", error);
    return NextResponse.json(
      { error: "Failed to fetch handoffs" },
      { status: 500 }
    );
  }
}

