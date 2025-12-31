import { isFeatureEnabled } from "@/lib/feature-flags";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { notFound, redirect } from "next/navigation";
import TechHandoffDetailClient from "./handoff-detail-client";

export default async function TechHandoffDetail({
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

  // Tech role can access this page
  if (contractorInfo.role !== "tech") {
    redirect("/contractor/dashboard");
  }

  const { estimateId } = await params;

  return <TechHandoffDetailClient estimateId={estimateId} />;
}



