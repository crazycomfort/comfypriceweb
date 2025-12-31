import { isFeatureEnabled } from "@/lib/feature-flags";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { notFound, redirect } from "next/navigation";
import ContractorHandoffClient from "./handoff-client";

export default async function ContractorHandoff({
  params,
}: {
  params: Promise<{ estimateId: string }>;
}) {
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

  // Only Owner Admin and Office can hand off estimates
  if (contractorInfo.role !== "owner_admin" && contractorInfo.role !== "office") {
    redirect("/contractor/dashboard");
  }

  const { estimateId } = await params;

  return <ContractorHandoffClient estimateId={estimateId} />;
}



