// Add-Ons & Upgrades Configuration API
import { NextRequest, NextResponse } from "next/server";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";

// In a full implementation, this would be stored in the database
// For now, we'll use a simple in-memory store (in production, use database)
const addonsStore = new Map<string, any>();

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

    // Only Owner Admin can access add-ons
    if (contractorInfo.role !== "owner_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get add-ons data for this company
    const addOnsData = addonsStore.get(contractorInfo.companyId) || {
      addOns: [],
      upgrades: [],
    };

    return NextResponse.json({
      success: true,
      addOnsData,
    });
  } catch (error) {
    console.error("Error fetching add-ons:", error);
    return NextResponse.json(
      { error: "Failed to fetch add-ons and upgrades" },
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

    // Only Owner Admin can update add-ons
    if (contractorInfo.role !== "owner_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { addOnsData } = body;

    // Validate structure
    if (!addOnsData || !Array.isArray(addOnsData.addOns) || !Array.isArray(addOnsData.upgrades)) {
      return NextResponse.json(
        { error: "Invalid add-ons data structure" },
        { status: 400 }
      );
    }

    // Validate add-ons
    const validTierIds = ["good", "better", "best"];
    const validCategories = ["comfort", "efficiency", "air-quality", "smart", "warranty", "other"];
    
    for (const addOn of addOnsData.addOns) {
      if (addOn.totalPrice !== null && (typeof addOn.totalPrice !== "number" || addOn.totalPrice < 0)) {
        return NextResponse.json(
          { error: `Invalid price for add-on ${addOn.id || addOn.name}` },
          { status: 400 }
        );
      }
      if (!validCategories.includes(addOn.category)) {
        return NextResponse.json(
          { error: `Invalid category for add-on ${addOn.id || addOn.name}` },
          { status: 400 }
        );
      }
      if (addOn.compatibleWith && Array.isArray(addOn.compatibleWith)) {
        for (const tierId of addOn.compatibleWith) {
          if (!validTierIds.includes(tierId)) {
            return NextResponse.json(
              { error: `Invalid tier ID in compatibleWith for add-on ${addOn.id || addOn.name}` },
              { status: 400 }
            );
          }
        }
      }
    }

    // Validate upgrades
    for (const upgrade of addOnsData.upgrades) {
      if (upgrade.totalPrice !== null && (typeof upgrade.totalPrice !== "number" || upgrade.totalPrice < 0)) {
        return NextResponse.json(
          { error: `Invalid price for upgrade ${upgrade.id || upgrade.name}` },
          { status: 400 }
        );
      }
      if (!["good", "better"].includes(upgrade.fromTier)) {
        return NextResponse.json(
          { error: `Invalid fromTier for upgrade ${upgrade.id || upgrade.name}` },
          { status: 400 }
        );
      }
      if (!["better", "best"].includes(upgrade.toTier)) {
        return NextResponse.json(
          { error: `Invalid toTier for upgrade ${upgrade.id || upgrade.name}` },
          { status: 400 }
        );
      }
      // Ensure upgrade path is valid (good -> better, better -> best)
      if (upgrade.fromTier === "good" && upgrade.toTier !== "better") {
        return NextResponse.json(
          { error: `Invalid upgrade path: good can only upgrade to better` },
          { status: 400 }
        );
      }
      if (upgrade.fromTier === "better" && upgrade.toTier !== "best") {
        return NextResponse.json(
          { error: `Invalid upgrade path: better can only upgrade to best` },
          { status: 400 }
        );
      }
    }

    // Store add-ons data (in production, save to database)
    addonsStore.set(contractorInfo.companyId, addOnsData);

    return NextResponse.json({
      success: true,
      addOnsData,
    });
  } catch (error) {
    console.error("Error updating add-ons:", error);
    return NextResponse.json(
      { error: "Failed to update add-ons and upgrades" },
      { status: 500 }
    );
  }
}



