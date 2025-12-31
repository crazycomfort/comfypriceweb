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
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your Estimate Experience
          </h2>
          <p className="text-lg text-slate-300">
            Review qualified leads and homeowner estimates from your branded estimate flow
          </p>
        </div>

        {/* Homeowner Preview Section */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-primary-200 shadow-2xl p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                This is what your customers see
              </h3>
              <p className="text-slate-600">
                Preview how homeowners experience your branded estimate flow
              </p>
            </div>
            <Link
              href="/homeowner/h1"
              target="_blank"
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Homeowner Experience
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Preview Card 1: Trust */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Build Trust</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Homeowners see realistic pricing ranges, clear explanations, and transparent education—not sales pressure.
              </p>
            </div>

            {/* Preview Card 2: Clarity */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Provide Clarity</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Plain-language explanations help homeowners understand pricing ranges, efficiency options, and what drives costs.
              </p>
            </div>

            {/* Preview Card 3: Conversion */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Convert Better</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pre-educated homeowners arrive with realistic expectations, reducing price objections and increasing conversion rates.
              </p>
            </div>
          </div>
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
              Create homeowner-facing pricing ranges
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
            <h3 className="text-xl font-bold text-white mb-2">Homeowner Estimates</h3>
            <p className="text-slate-400 text-sm">
              Review estimates generated through your estimate experience
            </p>
          </Link>

          {/* Reports */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 opacity-50">
            <div className="w-16 h-16 bg-green-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Trust-Building Insights</h3>
            <p className="text-slate-400 text-sm">
              Measure homeowner engagement and lead quality
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

