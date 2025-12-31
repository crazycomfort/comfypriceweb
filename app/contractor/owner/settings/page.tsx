import { isFeatureEnabled } from "@/lib/feature-flags";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { notFound, redirect } from "next/navigation";
import ContractorHeader from "@/app/components/ContractorHeader";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
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

  // Only Owner Admin can access
  if (contractorInfo.role !== "owner_admin") {
    redirect("/contractor/access-denied");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ContractorHeader />
      <SettingsClient />
    </main>
  );
}



