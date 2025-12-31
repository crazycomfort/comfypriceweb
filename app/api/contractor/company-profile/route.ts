// Company Profile API - Extended profile data for homeowner trust
import { NextRequest, NextResponse } from "next/server";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { getCompanyById, updateCompany } from "@/lib/storage";

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

    // Only Owner Admin can access profile
    if (contractorInfo.role !== "owner_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const company = await getCompanyById(contractorInfo.companyId);
    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      company: {
        ...company,
        // Extended profile fields (stored in JSON or separate fields)
        // For now, we'll return the basic company data
        // These can be extended in the database schema later
        yearsInBusiness: null,
        liabilityInsurance: null,
        workersCompInsurance: null,
        bondingInfo: null,
        certifications: null,
        serviceArea: null,
        numberOfEmployees: null,
        bbbRating: null,
      },
    });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch company profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Only Owner Admin can update profile
    if (contractorInfo.role !== "owner_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      address,
      licenseNumber,
      yearsInBusiness,
      liabilityInsurance,
      workersCompInsurance,
      bondingInfo,
      certifications,
      serviceArea,
      numberOfEmployees,
      bbbRating,
    } = body;

    // Update basic company fields
    const updatedCompany = await updateCompany(contractorInfo.companyId, {
      name: name || null,
      address: address || null,
      licenseNumber: licenseNumber || null,
      // Extended profile fields would be stored here
      // For now, we'll store them in a JSON field or extend the schema
      // This is a placeholder for future implementation
    });

    if (!updatedCompany) {
      return NextResponse.json(
        { error: "Failed to update company profile" },
        { status: 500 }
      );
    }

    // Return updated company with extended fields
    // In a full implementation, these would be stored and retrieved from the database
    return NextResponse.json({
      success: true,
      company: {
        ...updatedCompany,
        yearsInBusiness: yearsInBusiness || null,
        liabilityInsurance: liabilityInsurance || null,
        workersCompInsurance: workersCompInsurance || null,
        bondingInfo: bondingInfo || null,
        certifications: certifications || null,
        serviceArea: serviceArea || null,
        numberOfEmployees: numberOfEmployees || null,
        bbbRating: bbbRating || null,
      },
    });
  } catch (error) {
    console.error("Error updating company profile:", error);
    return NextResponse.json(
      { error: "Failed to update company profile" },
      { status: 500 }
    );
  }
}



