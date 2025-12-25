import { NextResponse } from "next/server";
import { getContractorSession } from "@/lib/session";
import { getContractorById } from "@/lib/storage";

export async function GET() {
  try {
    const session = await getContractorSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const contractor = await getContractorById(session.contractorId);
    
    if (!contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      contractor: {
        id: contractor.id,
        email: contractor.email,
        role: contractor.role,
        companyId: contractor.companyId,
      },
    });
  } catch (error) {
    console.error("Error fetching contractor info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

