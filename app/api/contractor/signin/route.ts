// Contractor sign-in API - Step 3
import { NextRequest, NextResponse } from "next/server";
import { getContractorByEmail } from "@/lib/storage";
import { verifyPassword } from "@/lib/auth";
import { setContractorSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const contractor = await getContractorByEmail(email);
    if (!contractor) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = verifyPassword(password, contractor.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create session
    await setContractorSession({
      contractorId: contractor.id,
      companyId: contractor.companyId,
      role: contractor.role,
      email: contractor.email,
    });

    return NextResponse.json({
      success: true,
      contractor: {
        id: contractor.id,
        email: contractor.email,
        companyId: contractor.companyId,
        role: contractor.role,
      },
    });
  } catch (error) {
    console.error("Contractor sign-in error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: process.env.NODE_ENV === "development" ? errorMessage : undefined },
      { status: 500 }
    );
  }
}

