// Contractor registration API - Step 3
import { NextRequest, NextResponse } from "next/server";
import { getContractorByEmail, createContractor, createCompany, updateContractor, getCompanyByCode, getCompanyById } from "@/lib/storage";
import { hashPassword } from "@/lib/auth";
import { setContractorSession } from "@/lib/session";

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

// Password validation helper
function isValidPassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters long" };
  }
  if (password.length > 128) {
    return { valid: false, error: "Password is too long (maximum 128 characters)" };
  }
  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === "https://placeholder.supabase.co" || 
        supabaseAnonKey === "placeholder-key") {
      console.error("Supabase not configured. Missing environment variables.");
      return NextResponse.json(
        { 
          error: "Server configuration error. Supabase database is not configured.",
          details: process.env.NODE_ENV === "development" 
            ? "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local" 
            : undefined
        },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { email, password, role, companyCode } = body;

    // Validate email
    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate password
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["owner_admin", "office", "tech"];
    const selectedRole = role || "tech";
    if (!validRoles.includes(selectedRole)) {
      return NextResponse.json(
        { error: "Invalid role selected" },
        { status: 400 }
      );
    }

    // For office and tech roles, require company code
    let companyId: string | null = null;
    if (selectedRole !== "owner_admin") {
      if (!companyCode || typeof companyCode !== "string" || companyCode.trim().length === 0) {
        return NextResponse.json(
          { error: "Company code is required for office and tech roles" },
          { status: 400 }
        );
      }

      // Look up company by code
      const company = await getCompanyByCode(companyCode.trim());
      if (!company) {
        return NextResponse.json(
          { error: "Invalid company code. Please check with your company admin or verify the code is correct." },
          { status: 400 }
        );
      }

      companyId = company.id;
    }

    // Check if contractor already exists
    const existing = await getContractorByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Create contractor
    const passwordHash = hashPassword(password);
    const contractor = await createContractor(
      normalizedEmail,
      passwordHash,
      selectedRole as "owner_admin" | "office" | "tech"
    );

    // Handle company creation/linking based on role
    let finalCompanyId: string;
    
    if (selectedRole === "owner_admin") {
      // Owner Admin creates a new company
      const company = await createCompany();
      finalCompanyId = company.id;
      
      // Link contractor to company
      const updatedContractor = await updateContractor(contractor.id, { companyId: company.id });
      
      if (!updatedContractor) {
        console.error("Failed to link contractor to company");
        return NextResponse.json(
          { error: "Failed to complete registration. Please try again." },
          { status: 500 }
        );
      }
    } else {
      // Office and Tech join existing company
      if (!companyId) {
        return NextResponse.json(
          { error: "Company code lookup failed. Please try again." },
          { status: 500 }
        );
      }

      const updatedContractor = await updateContractor(contractor.id, { companyId });
      
      if (!updatedContractor) {
        console.error("Failed to link contractor to company");
        return NextResponse.json(
          { error: "Failed to complete registration. Please try again." },
          { status: 500 }
        );
      }

      finalCompanyId = companyId;
    }

    // Create session
    await setContractorSession({
      contractorId: contractor.id,
      companyId: finalCompanyId,
      role: contractor.role,
      email: contractor.email,
    });

    // Get company code for owner_admin to return in response
    let companyCodeForResponse: string | null = null;
    if (selectedRole === "owner_admin") {
      const company = await getCompanyById(finalCompanyId);
      companyCodeForResponse = company?.companyCode || null;
    }

    return NextResponse.json({
      success: true,
      contractor: {
        id: contractor.id,
        email: contractor.email,
        companyId: finalCompanyId,
        role: contractor.role,
      },
      // Include company code for owner_admin so they can share it
      ...(selectedRole === "owner_admin" && companyCodeForResponse && {
        companyCode: companyCodeForResponse,
      }),
    });
  } catch (error) {
    console.error("Contractor registration error:", error);
    
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    } else {
      console.error("Unknown error type:", typeof error, error);
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "UnknownError";
    
    // Always include details for better debugging
    const errorDetails = `${errorName}: ${errorMessage}`;
    
    // Check for specific Supabase errors
    if (errorMessage.includes("duplicate key") || errorMessage.includes("unique constraint")) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }
    
    if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
      return NextResponse.json(
        { error: "Database tables not found. Please run the database schema setup.", details: errorDetails },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes("Missing Supabase environment variables")) {
      return NextResponse.json(
        { error: "Server configuration error. Supabase credentials are missing.", details: errorDetails },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes("Failed to create contractor") || errorMessage.includes("Failed to create company")) {
      return NextResponse.json(
        { error: "Database error. Please check your Supabase connection.", details: errorDetails },
        { status: 500 }
      );
    }
    
    // Return error with full details for debugging
    return NextResponse.json(
      { 
        error: "Registration failed. Please try again.", 
        details: errorDetails,
        // Include more context in development
        ...(process.env.NODE_ENV === "development" && {
          errorType: errorName,
          fullError: errorMessage,
        })
      },
      { status: 500 }
    );
  }
}

