// Pricebook Configuration API
import { NextRequest, NextResponse } from "next/server";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { getCompanyById } from "@/lib/storage";

// In a full implementation, this would be stored in the database
// For now, we'll use a simple in-memory store (in production, use database)
const pricebookStore = new Map<string, any>();

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

    // Only Owner Admin can access pricebook
    if (contractorInfo.role !== "owner_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get pricebook for this company
    const pricebook = pricebookStore.get(contractorInfo.companyId) || {
      tiers: [
        { id: "good", name: "Good", totalPrice: null, description: "Reliable, efficient system that meets basic needs" },
        { id: "better", name: "Better", totalPrice: null, description: "Enhanced performance with modern features and improved efficiency" },
        { id: "best", name: "Best", totalPrice: null, description: "Premium system with top-tier efficiency and smart home integration" },
      ],
      addOns: [],
    };

    return NextResponse.json({
      success: true,
      pricebook,
    });
  } catch (error) {
    console.error("Error fetching pricebook:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricebook" },
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

    // Only Owner Admin can update pricebook
    if (contractorInfo.role !== "owner_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { pricebook } = body;

    // Validate pricebook structure
    if (!pricebook || !pricebook.tiers || !Array.isArray(pricebook.tiers)) {
      return NextResponse.json(
        { error: "Invalid pricebook structure" },
        { status: 400 }
      );
    }

    // Validate tiers
    const validTierIds = ["good", "better", "best"];
    for (const tier of pricebook.tiers) {
      if (!validTierIds.includes(tier.id)) {
        return NextResponse.json(
          { error: `Invalid tier ID: ${tier.id}` },
          { status: 400 }
        );
      }
      if (tier.totalPrice !== null && (typeof tier.totalPrice !== "number" || tier.totalPrice < 0)) {
        return NextResponse.json(
          { error: `Invalid price for tier ${tier.id}` },
          { status: 400 }
        );
      }
    }

    // Validate add-ons if present
    if (pricebook.addOns && Array.isArray(pricebook.addOns)) {
      for (const addOn of pricebook.addOns) {
        if (addOn.totalPrice !== null && (typeof addOn.totalPrice !== "number" || addOn.totalPrice < 0)) {
          return NextResponse.json(
            { error: `Invalid price for add-on ${addOn.id || addOn.name}` },
            { status: 400 }
          );
        }
        if (addOn.compatibleWith && !Array.isArray(addOn.compatibleWith)) {
          return NextResponse.json(
            { error: `Invalid compatibleWith for add-on ${addOn.id || addOn.name}` },
            { status: 400 }
          );
        }
      }
    }

    // Store pricebook (in production, save to database)
    pricebookStore.set(contractorInfo.companyId, pricebook);

    return NextResponse.json({
      success: true,
      pricebook,
    });
  } catch (error) {
    console.error("Error updating pricebook:", error);
    return NextResponse.json(
      { error: "Failed to update pricebook" },
      { status: 500 }
    );
  }
}



