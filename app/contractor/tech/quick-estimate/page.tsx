import { isFeatureEnabled } from "@/lib/feature-flags";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function TechQuickEstimate() {
  // Feature flag gate
  if (!isFeatureEnabled("contractorFlow")) {
    notFound();
  }
  
  // Contractor access gate
  const hasAccess = await hasContractorAccess();
  if (!hasAccess) {
    redirect("/contractor/access-denied");
  }

  const contractorInfo = await getContractorInfo();
  if (!contractorInfo) {
    redirect("/contractor/access-denied");
  }

  // Tech role can access this page
  // Office and Owner Admin can also access (they have broader permissions)
  if (contractorInfo.role !== "tech" && contractorInfo.role !== "office" && contractorInfo.role !== "owner_admin") {
    redirect("/contractor/access-denied");
  }

  // Redirect to the existing C1 flow (which is the tech flow)
  redirect("/contractor/c1");
}

