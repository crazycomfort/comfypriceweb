import { isFeatureEnabled } from "@/lib/feature-flags";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { isCompanySetupComplete } from "@/lib/company-setup";
import { notFound, redirect } from "next/navigation";
import ContractorC4Client from "./c4-client";

export default async function ContractorC4() {
  // Feature flag gate
  if (!isFeatureEnabled("contractorFlow")) {
    notFound();
  }
  
  // Contractor access gate
  const hasAccess = await hasContractorAccess();
  if (!hasAccess) {
    redirect("/contractor/access-denied");
  }
  
  // Company setup completion gate
  const contractorInfo = await getContractorInfo();
  const setupComplete = await isCompanySetupComplete(contractorInfo?.companyId || null);
  if (!setupComplete) {
    redirect("/contractor/setup-required");
  }

  return <ContractorC4Client />;
}
