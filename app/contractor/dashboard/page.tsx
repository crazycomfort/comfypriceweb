import { isFeatureEnabled } from "@/lib/feature-flags";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function ContractorDashboard() {
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

  const { role } = contractorInfo;

  // Route based on role
  if (role === "owner_admin") {
    redirect("/contractor/owner/dashboard");
  } else if (role === "office") {
    redirect("/contractor/office/dashboard");
  } else if (role === "tech") {
    redirect("/contractor/tech/quick-estimate");
  }

  // Fallback
  redirect("/contractor/tech/quick-estimate");
}


