// Contractor registration API - Step 3
import { NextRequest, NextResponse } from "next/server";
import { getContractorByEmail, createContractor, createCompany, updateContractor } from "@/lib/storage";
import { hashPassword } from "@/lib/auth";
import { setContractorSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if contractor already exists
    const existing = await getContractorByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Create contractor
    const passwordHash = hashPassword(password);
    const contractor = await createContractor(
      email,
      passwordHash,
      role || "tech"
    );

    // Create company for contractor
    const company = await createCompany();
    
    // Link contractor to company
    await updateContractor(contractor.id, { companyId: company.id });

    // Create session
    await setContractorSession({
      contractorId: contractor.id,
      companyId: company.id,
      role: contractor.role,
      email: contractor.email,
    });

    return NextResponse.json({
      success: true,
      contractor: {
        id: contractor.id,
        email: contractor.email,
        companyId: company.id,
        role: contractor.role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

