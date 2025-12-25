// Company setup API - Step 3
import { NextRequest, NextResponse } from "next/server";
import { getContractorSession } from "@/lib/session";
import { getCompanyById, updateCompany } from "@/lib/storage";
import { updateContractor } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const session = await getContractorSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Company isolation: ensure user can only update their own company
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

    const body = await request.json();
    const { name, address, licenseNumber, taxId, paymentMethod } = body;

    // Update company (company isolation enforced via session.companyId)
    const updatedCompany = await updateCompany(session.companyId, {
      name: name || company.name,
      address: address || company.address,
      licenseNumber: licenseNumber || company.licenseNumber,
      taxId: taxId || company.taxId,
      paymentMethod: paymentMethod || company.paymentMethod,
    });

    if (!updatedCompany) {
      return NextResponse.json(
        { error: "Failed to update company" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      company: updatedCompany,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

