import { NextResponse } from "next/server";
import { getContractorSession } from "@/lib/session";
import { getCompanyById } from "@/lib/storage";

export async function GET() {
  try {
    const session = await getContractorSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!session.companyId) {
      return NextResponse.json(
        { error: "No company associated with account" },
        { status: 400 }
      );
    }

    const company = await getCompanyById(session.companyId);
    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        address: company.address,
        licenseNumber: company.licenseNumber,
        taxId: company.taxId,
        paymentMethod: company.paymentMethod,
        companyCode: company.companyCode,
        isVerified: company.isVerified,
      },
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

