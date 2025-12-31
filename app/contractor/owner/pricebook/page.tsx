import { isFeatureEnabled } from "@/lib/feature-flags";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { notFound, redirect } from "next/navigation";
import ContractorPricebookClient from "./pricebook-client";

export default async function ContractorPricebook() {
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

  // Only Owner Admin can access pricebook
  if (contractorInfo.role !== "owner_admin") {
    redirect("/contractor/dashboard");
  }

  return <ContractorPricebookClient />;
}



