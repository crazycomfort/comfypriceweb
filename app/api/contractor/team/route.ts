import { NextResponse } from "next/server";
import { getContractorSession } from "@/lib/session";
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

    // Only owner_admin can view team members
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

    const contractors = await getContractorsByCompanyId(session.companyId);

    // Remove password hashes from response
    const teamMembers = contractors.map(({ passwordHash, ...contractor }) => ({
      ...contractor,
      createdAt: contractor.createdAt,
    }));

    return NextResponse.json({
      team: teamMembers,
    });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



