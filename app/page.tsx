import Link from "next/link";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { hasContractorAccess } from "@/lib/contractor-access";
import Logo from "@/app/components/Logo";
import OnboardingWrapper from "@/app/components/OnboardingWrapper";

export default async function LandingPage() {
  const contractorFlowEnabled = isFeatureEnabled("contractorFlow");
  const educationPageEnabled = isFeatureEnabled("educationPage");
  const isContractor = contractorFlowEnabled ? await hasContractorAccess() : false;

  return (
    <OnboardingWrapper>
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-8 rounded-2xl shadow-xl">
                <Logo size="xl" variant="dark-bg" />
              </div>
            </div>
            
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 border border-primary-200 mb-8">
              <span className="text-sm font-medium text-primary-700">
                🏆 Trusted by homeowners nationwide
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              Know Your HVAC Cost
              <span className="block text-primary-600 mt-2">Before You Buy</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-4 leading-relaxed max-w-2xl mx-auto">
              Get a transparent, ballpark HVAC estimate in 2 minutes.
              <span className="block mt-2 text-lg text-gray-500">
                No hidden fees. No sales calls. Just honest pricing.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10 mb-12">
              <Link
                href="/homeowner/h1"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg min-w-[200px] cursor-pointer"
              >
                Start Free Estimate
                <span className="ml-2">→</span>
              </Link>
              
              {contractorFlowEnabled && (
                <Link
                  href={isContractor ? "/contractor/dashboard" : "/contractor/signin"}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md text-lg min-w-[200px] cursor-pointer"
                >
                  {isContractor ? "Contractor Dashboard" : "Contractor Sign In"}
                </Link>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 mt-8">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>2 Minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <Logo size="md" variant="light-bg" className="inline-block" />?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We believe transparency builds trust. Get the information you need to make informed decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent Pricing</h3>
              <p className="text-gray-600 leading-relaxed">
                See exactly what goes into your estimate. No hidden fees, no surprises—just honest, upfront pricing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Easy</h3>
              <p className="text-gray-600 leading-relaxed">
                Get your ballpark estimate in just 2 minutes. Simple questions, instant results—no complicated forms.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Regional Accuracy</h3>
              <p className="text-gray-600 leading-relaxed">
                Our estimates account for regional pricing differences, labor costs, and local market conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to get your HVAC estimate
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tell Us About Your Home</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Enter your ZIP code, square footage, and a few basic details about your property.
                </p>
              </div>
              <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-gray-200 -ml-4">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-gray-200 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Your Preferences</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Choose your desired system type, efficiency level, and any special features you want.
                </p>
              </div>
              <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-gray-200 -ml-4">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-gray-200 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Your Estimate</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Receive your personalized ballpark estimate with a transparent price range and key assumptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            Join thousands of homeowners who've used <Logo size="sm" variant="dark-bg" className="inline-block" /> to make informed HVAC decisions.
          </p>
          <Link
            href="/homeowner/h1"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl text-lg cursor-pointer border-2 border-primary-600 hover:border-primary-700"
          >
            Start Your Free Estimate →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              © {new Date().getFullYear()} <Logo size="sm" variant="light-bg" className="inline-block" />. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              {educationPageEnabled && (
                <Link href="/education" className="text-gray-600 hover:text-primary-700 transition-colors">
                  Learn About HVAC
                </Link>
              )}
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Transparent • Free • Fast</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
    </OnboardingWrapper>
  );
}
