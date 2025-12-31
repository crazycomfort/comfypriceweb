"use client";

import Link from "next/link";
import Logo from "@/app/components/Logo";
import { useRouter } from "next/navigation";

export default function ContractorValueOrientation() {
  const router = useRouter();

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Top Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/contractor" className="flex items-center">
              <Logo size="md" variant="light-bg" />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/contractor/dashboard"
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                Skip to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Pricing Authority Partner Network
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            This makes your job easier without getting in your way. Homeowners arrive educated about pricing, reducing explanation burden and improving close quality. You retain full pricing authority.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {/* Contractor Control - Prominent */}
            <div className="bg-primary-50 rounded-xl border-2 border-primary-200 p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">
                    You Are The Final Validator
                  </h2>
                  <p className="text-slate-700 leading-relaxed mb-4 text-lg">
                    Homeowners arrive informed, pre-qualified, and aligned on realistic investment ranges before you ever step on-site. You validate structured estimates and confirm final pricing after your professional on-site evaluation. You are not setting prices blindly—you are validating informed homeowner expectations.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-primary-100">
                    <p className="text-slate-700 font-semibold mb-2">Your Role as Validator:</p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Review pre-qualified homeowners with realistic expectations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Validate structured estimates based on on-site conditions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Confirm final pricing after professional assessment</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Reassurance Section */}
            <div className="bg-green-50 rounded-xl border border-green-200 p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Your Protection & Control
              </h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-5 border border-green-100">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Estimates Are Non-Binding
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    All pricing ranges shown to homeowners are educational estimates, not binding quotes. Homeowners understand these are planning tools, not final pricing. Only your professional evaluation and approval create a binding estimate.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-5 border border-green-100">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Ranges Are Homeowner-Safe
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Pricing ranges are designed to educate homeowners, not expose your internal pricing structure. All ranges are presented as flat-rate totals with no labor, margin, or equipment breakdowns. This protects your pricing while building homeowner trust.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-5 border border-green-100">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Contractors Approve All Final Numbers
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Every estimate requires your explicit approval before it's finalized. You can modify pricing, add professional notes, or set custom pricing outside the educational ranges. Homeowners see your professional assessment, not automated calculations.
                  </p>
                </div>
              </div>
            </div>

            {/* Homeowner Education Focus */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-3">
                    Homeowner Education, Not Automation
                  </h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    COMFYprice educates homeowners about realistic HVAC pricing ranges, efficiency options, and what drives installation costs. This education happens before they contact you, so your consultations focus on their specific home needs rather than basic HVAC education.
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    When homeowners understand typical pricing ranges and system options before your visit, they arrive with realistic expectations. This reduces "sticker shock" conversations and price objections, allowing you to focus on system selection, installation details, and closing the sale.
                  </p>
                </div>
              </div>
            </div>

            {/* Outcome 1: Margin Protection */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-3">
                    Protect Your Margins
                  </h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Homeowners arrive with realistic expectations about pricing ranges. This reduces price objections and "sticker shock" conversations that can erode margins or require extensive justification.
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    When homeowners understand typical pricing ranges before your visit, they're more likely to accept estimates that fall within those ranges. This helps maintain your pricing structure without needing to discount or explain basic cost components.
                  </p>
                </div>
              </div>
            </div>

            {/* Outcome 2: Better Qualified Leads */}


            {/* Outcome 3: Better Qualified Leads */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-3">
                    Better Qualified Appointments
                  </h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Homeowners who complete the estimate flow have demonstrated serious intent and have realistic expectations. This typically leads to higher conversion rates and fewer wasted site visits.
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    When homeowners request appointments after using COMFYprice, they've already invested time understanding their needs and pricing expectations. These appointments are more likely to result in closed sales.
                  </p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">How It Works</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <p className="text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">Homeowners use COMFYprice</strong> to learn about realistic pricing ranges based on their home characteristics and preferences. This is education, not automation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <p className="text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">They arrive informed</strong> about typical pricing ranges, efficiency options, and what drives installation costs. They understand these are educational estimates, not binding quotes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <p className="text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">You provide your professional evaluation</strong> and set final pricing based on your on-site assessment. You can approve, modify, or set pricing outside the educational ranges.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                    4
                  </div>
                  <div>
                    <p className="text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">Higher conversion rates</strong> result from better-qualified leads, realistic expectations, and reduced price objections—all while you maintain full pricing authority.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* What COMFYprice Does Not Do */}
            <div className="bg-white rounded-xl border border-slate-200 p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">What COMFYprice Does Not Do</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    COMFYprice does not set or recommend specific pricing for your company. It provides homeowners with educational ranges based on regional and home characteristics. Final pricing is confirmed after on-site validation.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    COMFYprice does not replace your on-site evaluation or professional judgment. All estimates require your validation. Final pricing is confirmed after on-site validation based on your professional assessment of actual site conditions.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    COMFYprice does not sell homeowner data or leads. Homeowners control when and if they request appointments. You maintain full control over your pricing and business relationships.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-primary-50 rounded-xl border border-primary-200 p-8 text-center">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Ready to Get Started?</h2>
              <p className="text-slate-700 mb-6 leading-relaxed max-w-2xl mx-auto">
                Configure your homeowner estimate experience to build trust and protect your pricing authority.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contractor/dashboard"
                  className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/contractor"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white border-2 border-primary-600 text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-all duration-200 cursor-pointer"
                >
                  Return to Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

