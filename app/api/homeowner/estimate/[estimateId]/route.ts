// Get homeowner estimate by ID - Step 4
import { NextRequest, NextResponse } from "next/server";
import { getEstimateById } from "@/lib/estimate-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ estimateId: string }> }
) {
  try {
    const { estimateId } = await params;
    const estimate = await getEstimateById(estimateId);

    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    // Homeowner safe: only return homeowner estimates or public estimates
    if (!estimate.isHomeowner && !estimate.companyId) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      estimate,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch estimate" },
      { status: 500 }
    );
  }
}

