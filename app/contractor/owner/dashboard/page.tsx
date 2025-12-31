import { isFeatureEnabled } from "@/lib/feature-flags";
import { hasContractorAccess, getContractorInfo } from "@/lib/contractor-access";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ContractorHeader from "@/app/components/ContractorHeader";
import EstimateHistory from "@/app/components/EstimateHistory";
import { SecondarySection, SecondaryHeader, Card } from "@/app/components/SectionHierarchy";
import { CONTRACTOR_VALUE_PROPOSITION, CONTRACTOR_ROLE_DEFINITION } from "@/lib/contractor-policies";

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

      <SecondarySection background="subtle" className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <SecondaryHeader
          title="Pricing Authority Partner Console"
          subtitle="Review pre-qualified homeowners, validate structured estimates, and close higher-trust opportunities."
          align="center"
          className="mb-12 text-white [&_h2]:text-white [&_p]:text-slate-300"
        />

        {/* Premium Value Proposition Block - Contractor-facing only */}
        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 rounded-2xl border-2 border-amber-300 shadow-xl p-8 mb-8 max-w-4xl mx-auto">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Your Competitive Advantage
              </h3>
              <p className="text-slate-800 text-lg leading-relaxed mb-4 font-medium">
                {CONTRACTOR_VALUE_PROPOSITION.positioningStatement}
              </p>
              <p className="text-slate-700 text-base leading-relaxed mb-6">
                This makes your job easier without getting in your way. Homeowners arrive educated, reducing explanation burden and improving close quality.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {CONTRACTOR_VALUE_PROPOSITION.keyBenefits.map((benefit, index) => (
                  <div key={index} className="bg-white rounded-lg border border-amber-200 p-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-slate-800 font-medium text-sm">{benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Control Reassurance Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-300 shadow-xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Your Pricing Control & Protection
              </h3>
              <p className="text-slate-700 text-lg leading-relaxed mb-6">
                You always control final pricing. The ranges shown to homeowners are educational estimates, not commitments. Every final price requires your professional approval.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Philosophy Card */}
                <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Our Pricing Philosophy
                  </h4>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Pricing ranges educate homeowners about realistic expectations. They help set the right context before your visit, but they never replace your professional judgment or lock you into specific numbers.
                  </p>
                </div>

                {/* Contractor Control Card */}
                <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    You Control Final Pricing
                  </h4>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    You can override, adjust, or set pricing completely outside the ranges shown to homeowners. Your on-site evaluation and professional assessment determine final pricing—not automated calculations.
                  </p>
                </div>

                {/* Non-Binding Card */}
                <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Ranges Are Not Commitments
                  </h4>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Homeowners understand these are planning estimates, not binding quotes. Only your professional evaluation and written estimate create a commitment. The ranges simply help set realistic expectations.
                  </p>
                </div>

                {/* Protection Card */}
                <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Your Business Protection
                  </h4>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Your pricing structure, margins, and business model are protected. Homeowners see flat-rate totals only—no labor breakdowns, no margin exposure, no internal pricing details.
                  </p>
                </div>
              </div>
            </div>
          </div>
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

        {/* Contractor Value Callouts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Pre-qualifies serious homeowners</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Homeowners who complete your estimate experience demonstrate real intent and realistic expectations
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/30 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Reduces price objections</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Pre-educated homeowners understand realistic pricing, so you spend less time justifying costs
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/30 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Improves close rates through education</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Better-informed homeowners make decisions faster and with more confidence
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/30 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Protects margins while increasing transparency</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Build homeowner trust through education without exposing your internal pricing structure
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Review Console Section - Validation Workspace */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Review Console</h3>
          <p className="text-slate-400 text-sm mb-6">
            Review pre-qualified homeowners and validate structured estimates. This is your professional validation workspace.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pricing Authority */}
          <Link
            href="/contractor/owner/pricebook"
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 hover:bg-white/15 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-purple-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pricing Authority</h3>
            <p className="text-slate-400 text-sm">
              Set your Good/Better/Best pricing ranges that homeowners see in your estimate experience
            </p>
          </Link>


          {/* Company Profile */}
          <Link
            href="/contractor/owner/profile"
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 hover:bg-white/15 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-pink-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Company Profile</h3>
            <p className="text-slate-400 text-sm">
              Build credibility with licensing, insurance, and professional details shown in your estimate experience
            </p>
          </Link>

          {/* Educational Add-Ons */}
          <Link
            href="/contractor/owner/addons"
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 hover:bg-white/15 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-indigo-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Educational Add-Ons</h3>
            <p className="text-slate-400 text-sm">
              Configure optional upgrades shown in your estimate experience that educate homeowners about value
            </p>
          </Link>

          {/* Team Credibility */}
          <Link
            href="/contractor/owner/users"
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 hover:bg-white/15 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-green-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Team Credibility</h3>
            <p className="text-slate-400 text-sm">
              Manage team access to your estimate experience and maintain professional standards
            </p>
          </Link>
        </div>

        {/* Professional Inbox Section */}
        <div className="mt-12 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Professional Inbox</h3>
          <p className="text-slate-400 text-sm mb-6">
            Review pre-qualified homeowners who completed structured estimates and requested next steps. These are validation opportunities, not cold leads.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Qualified Leads */}
          <Link
            href="/contractor/owner/leads"
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 hover:bg-white/15 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-cyan-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pre-Qualified Homeowners</h3>
            <p className="text-slate-400 text-sm">
              Review homeowners who completed structured estimates. See confidence signals, engagement levels, and validation status.
            </p>
          </Link>

          {/* Homeowner Estimates */}
          <Link
            href="/contractor/estimates"
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 hover:bg-white/15 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-orange-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Structured Estimates</h3>
            <p className="text-slate-400 text-sm">
              Review and validate structured estimates. Accept for review, request site evaluation, or add internal notes.
            </p>
          </Link>

          {/* Trust-Building Insights */}
          <Link
            href="/contractor/owner/reports"
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 hover:bg-white/15 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-emerald-500/30 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Trust-Building Insights</h3>
            <p className="text-slate-400 text-sm">
              Measure how homeowners engage with your estimate experience and track conversion quality
            </p>
          </Link>
        </div>

        {/* Estimate History Section */}
        <div className="mt-12">
          <EstimateHistory limit={5} showViewAll={true} />
        </div>
      </SecondarySection>
    </main>
  );
}

