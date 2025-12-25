import { isFeatureEnabled } from "@/lib/feature-flags";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ContractorHeader from "@/app/components/ContractorHeader";
import EstimateHistory from "@/app/components/EstimateHistory";

export default async function OwnerDashboard() {
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
      {/* Header */}
      <ContractorHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Owner Admin Dashboard
          </h2>
          <p className="text-lg text-slate-300">
            Full access to company management and all tools
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
              Generate pricing estimates
            </p>
          </Link>

          {/* Company Setup */}
          <Link
            href="/contractor/company-setup"
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 hover:bg-white/15 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-purple-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Company Setup</h3>
            <p className="text-slate-400 text-sm">
              Configure company settings and preferences
            </p>
          </Link>

          {/* User Management */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 opacity-50">
            <div className="w-16 h-16 bg-green-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
            <p className="text-slate-400 text-sm">
              Manage team members and permissions
            </p>
            <span className="inline-block mt-3 text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
              Coming Soon
            </span>
          </div>

          {/* Client Estimates */}
          <Link
            href="/contractor/estimates"
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 hover:bg-white/15 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-orange-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Client Estimates</h3>
            <p className="text-slate-400 text-sm">
              View and manage all company estimates
            </p>
          </Link>

          {/* Reports & Analytics */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 opacity-50">
            <div className="w-16 h-16 bg-emerald-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Reports & Analytics</h3>
            <p className="text-slate-400 text-sm">
              Company-wide statistics and insights
            </p>
            <span className="inline-block mt-3 text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
              Coming Soon
            </span>
          </div>

          {/* Settings */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 opacity-50">
            <div className="w-16 h-16 bg-pink-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Settings</h3>
            <p className="text-slate-400 text-sm">
              Company settings and preferences
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

