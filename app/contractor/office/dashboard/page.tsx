import { isFeatureEnabled } from "@/lib/feature-flags";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ContractorHeader from "@/app/components/ContractorHeader";
import EstimateHistory from "@/app/components/EstimateHistory";

export default async function OfficeDashboard() {
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

  // Office and Owner Admin can access
  if (contractorInfo.role !== "office" && contractorInfo.role !== "owner_admin") {
    redirect("/contractor/access-denied");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <ContractorHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Office Dashboard
          </h2>
          <p className="text-lg text-slate-300">
            Manage client estimates and administrative tasks
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Estimate */}
          <Link
            href="/contractor/c1"
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 hover:bg-white/15 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-primary-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Quick Estimate</h3>
            <p className="text-slate-400 text-sm">
              Generate pricing estimates for clients
            </p>
          </Link>

          {/* Client Estimates */}
          <Link
            href="/contractor/estimates"
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 hover:bg-white/15 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-purple-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Client Estimates</h3>
            <p className="text-slate-400 text-sm">
              View and manage all client estimates
            </p>
          </Link>

          {/* Reports */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 opacity-50">
            <div className="w-16 h-16 bg-green-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Reports & Analytics</h3>
            <p className="text-slate-400 text-sm">
              View estimate statistics and reports
            </p>
            <span className="inline-block mt-3 text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Estimate History Section */}
        <div className="mt-12">
          <EstimateHistory limit={5} showViewAll={true} />
        </div>
      </div>
    </main>
  );
}

