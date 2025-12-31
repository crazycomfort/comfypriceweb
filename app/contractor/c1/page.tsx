import { hasContractorAccess } from "@/lib/contractor-access";
import { redirect } from "next/navigation";
import ContractorC1Client from "./c1-client";

export default async function ContractorC1() {
  // Contractor access gate
  const hasAccess = await hasContractorAccess();
  if (!hasAccess) {
    redirect("/contractor/access-denied");
  }

  return <ContractorC1Client />;
}
