// Contractor Leads API
import { NextRequest, NextResponse } from "next/server";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { getLeadQualityIndicators, getLeadSignalsForEstimate, getReadinessTier, getReadinessTierMetadata } from "@/lib/lead-qualification";

// In a full implementation, this would be stored in the database
// For now, we'll use a simple in-memory store (in production, use database)
const leadsStore = new Map<string, any[]>();

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

    // Owner Admin and Office can access leads
    if (contractorInfo.role !== "owner_admin" && contractorInfo.role !== "office") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get leads for this company
    const leads = leadsStore.get(contractorInfo.companyId) || [];

    // Add quality indicators and readiness tier to each lead
    const leadsWithIndicators = leads.map(lead => {
      // Get estimateId from lead (if stored)
      const estimateId = lead.estimateId;
      let indicators: string[] = [];
      let readinessTier: string | null = null;
      let readinessMetadata: { expectedTimeline: string; recommendedAction: string } | null = null;
      
      if (estimateId) {
        const signals = getLeadSignalsForEstimate(estimateId);
        indicators = getLeadQualityIndicators(signals);
        readinessTier = getReadinessTier(signals);
        readinessMetadata = getReadinessTierMetadata(getReadinessTier(signals));
      }
      
      return {
        ...lead,
        qualityIndicators: indicators,
        readinessTier,
        readinessMetadata,
      };
    });

    // Sort by created date (newest first)
    const sortedLeads = leadsWithIndicators.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      leads: sortedLeads,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    // Owner Admin and Office can update leads
    if (contractorInfo.role !== "owner_admin" && contractorInfo.role !== "office") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { leadId, status, notes } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    // Get leads for this company
    const leads = leadsStore.get(contractorInfo.companyId) || [];
    const leadIndex = leads.findIndex(lead => lead.id === leadId);

    if (leadIndex === -1) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Update lead
    if (status) {
      const validStatuses = ["new", "contacted", "scheduled", "completed", "lost"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      leads[leadIndex].status = status;
    }

    if (notes !== undefined) {
      leads[leadIndex].notes = notes;
    }

    leads[leadIndex].updatedAt = new Date().toISOString();

    // Save back to store
    leadsStore.set(contractorInfo.companyId, leads);

    return NextResponse.json({
      success: true,
      lead: leads[leadIndex],
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

// Helper function to create a lead (called from contact API)
export async function createLead(companyId: string, leadData: {
  name: string;
  email?: string;
  phone?: string;
  preferredContact: "email" | "phone";
  zipCode: string;
  squareFootage: string;
  systemType: string;
  estimateRange: { min: number; max: number };
  preferredTier?: "good" | "better" | "best";
  timeline?: string;
  estimateId?: string;
}): Promise<string> {
  const leads = leadsStore.get(companyId) || [];
  
  const newLead = {
    id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: "new" as const,
    name: leadData.name,
    contactMethod: leadData.preferredContact,
    contactInfo: leadData.preferredContact === "email" ? (leadData.email || "") : (leadData.phone || ""),
    zipCode: leadData.zipCode,
    squareFootage: leadData.squareFootage,
    systemType: leadData.systemType,
    estimateRange: leadData.estimateRange,
    preferredTier: leadData.preferredTier,
    timeline: leadData.timeline,
    estimateId: leadData.estimateId, // Store estimateId for quality indicators
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  leads.push(newLead);
  leadsStore.set(companyId, leads);

  return newLead.id;
}

