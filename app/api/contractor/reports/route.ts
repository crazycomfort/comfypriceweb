import { NextResponse } from "next/server";
import { getContractorSession } from "@/lib/session";
import { getEstimatesByCompany } from "@/lib/estimate-storage";
import { getContractorsByCompanyId } from "@/lib/storage";

export async function GET() {
  try {
    const session = await getContractorSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only owner_admin can view reports
    if (session.role !== "owner_admin") {
      return NextResponse.json(
        { error: "Forbidden - Owner admin access required" },
        { status: 403 }
      );
    }

    if (!session.companyId) {
      return NextResponse.json(
        { error: "No company associated with account" },
        { status: 400 }
      );
    }

    // Get estimates
    const estimates = await getEstimatesByCompany(session.companyId);
    
    // Get team members
    const teamMembers = await getContractorsByCompanyId(session.companyId);

    // Calculate stats
    const totalEstimates = estimates.length;
    const totalTeamMembers = teamMembers.length;
    
    // Recent estimates (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEstimates = estimates.filter((est) => {
      const estimateDate = new Date(est.estimateId);
      return estimateDate >= thirtyDaysAgo;
    }).length;

    // Estimate value totals (if available)
    const totalValue = estimates.reduce((sum, est) => {
      const value = est.totalPrice || 0;
      return sum + value;
    }, 0);

    // Group by role
    const roleCounts = {
      owner_admin: teamMembers.filter((m) => m.role === "owner_admin").length,
      office: teamMembers.filter((m) => m.role === "office").length,
      tech: teamMembers.filter((m) => m.role === "tech").length,
    };

    return NextResponse.json({
      stats: {
        totalEstimates,
        recentEstimates,
        totalTeamMembers,
        totalValue,
        roleCounts,
      },
      estimates: estimates.slice(0, 10), // Latest 10 for display
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



