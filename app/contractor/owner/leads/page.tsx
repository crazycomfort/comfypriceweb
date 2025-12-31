import { isFeatureEnabled } from "@/lib/feature-flags";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { notFound, redirect } from "next/navigation";
import ContractorLeadsClient from "./leads-client";

export default async function ContractorLeads() {
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

  // Owner Admin and Office can access leads
  if (contractorInfo.role !== "owner_admin" && contractorInfo.role !== "office") {
    redirect("/contractor/dashboard");
  }

  return <ContractorLeadsClient />;
}



