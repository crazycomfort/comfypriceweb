import { isFeatureEnabled } from "@/lib/feature-flags";
import { hasContractorAccess } from "@/lib/contractor-access";
import { notFound, redirect } from "next/navigation";
import ContractorC1Client from "./c1-client";

export default async function ContractorC1() {
  // Feature flag gate
  if (!isFeatureEnabled("contractorFlow")) {
    notFound();
  }
  
  // Contractor access gate
  const hasAccess = await hasContractorAccess();
  if (!hasAccess) {
    redirect("/contractor/access-denied");
  }

  return <ContractorC1Client />;
}
