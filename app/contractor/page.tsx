"use client";

import Link from "next/link";
import Logo from "@/app/components/Logo";

export default function ContractorEntry() {
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
                href="/contractor/signin"
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Pricing Authority Partner Network
          </h1>
          <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto">
            Review pre-qualified homeowners, validate structured estimates, and close higher-trust opportunities. This is a premium network, not a commodity lead marketplace.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sign In Card */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">
                Sign In
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Access your Pricing Authority Partner console to review pre-qualified homeowners, validate structured estimates, and manage your validation workspace.
              </p>
              <Link
                href="/contractor/signin"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
              >
                Sign In to Your Account
              </Link>
            </div>

            {/* Request Access Card */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">
                Request Access
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Request access to the Pricing Authority Partner network. Premium partners review pre-qualified homeowners and validate structured estimates.
              </p>
              <Link
                href="/contractor/register"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-white border-2 border-primary-600 text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-all duration-200 cursor-pointer"
              >
                Register New Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Orientation Link */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
            <p className="text-slate-700 mb-4">
              New to COMFYprice? Learn how it works for contractors.
            </p>
            <Link
              href="/contractor/value-orientation"
              className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-800 font-medium transition-colors"
            >
              View Value Orientation
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Your Homeowner Estimate Experience</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Configure pricing ranges that educate homeowners and build trust before they contact you.
              </p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Team Credibility</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Manage your team's access to pricing tools and maintain professional standards across your organization.
              </p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Trust-Building Insights</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track how homeowners engage with your pricing authority and measure the quality of qualified leads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              Need help? Contact your company administrator or system support.
            </p>
            <Link
              href="/"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Return to Public Site
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

