import Link from "next/link";
import Logo from "@/app/components/Logo";

export default function WhyDifferentPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary-100 hover:text-white mb-8 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
            <div className="mb-6">
              <Logo size="lg" variant="dark-bg" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Why This Estimate Is Different
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              We built this experience to give you honest, realistic pricing information—not to sell you something.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="space-y-12">
          {/* Education-First Approach */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Education-First Approach
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Every step of this estimate explains <em>why</em> your choices affect cost. We don't just ask for information—we help you understand how home size, system efficiency, and installation complexity create realistic price ranges.
                </p>
                <p className="text-base text-gray-600 mt-4 leading-relaxed">
                  You'll learn about HVAC systems as you go, so when you see your estimate range, you'll understand what drives it. This isn't a quiz—it's a guided consultation that builds your confidence in the numbers.
                </p>
              </div>
            </div>
          </section>

          {/* No Sales Pressure */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  No Sales Pressure
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  This estimate is designed to inform, not persuade. You won't see urgency tactics, limited-time offers, or "as low as" pricing. We show you realistic ranges based on your actual situation.
                </p>
                <p className="text-base text-gray-600 mt-4 leading-relaxed">
                  Nothing here locks you in. You can save your estimate, share it with someone you trust, or come back later. When you're ready to talk to a contractor, you'll do so with realistic expectations and confidence in the numbers.
                </p>
              </div>
            </div>
          </section>

          {/* Realistic Ranges, Not Bait Pricing */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Realistic Ranges, Not Bait Pricing
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We show you price <em>ranges</em>, not artificially low starting prices that exclude essential work. Your estimate accounts for typical installation scenarios, including professional installation, code compliance, and quality equipment.
                </p>
                <p className="text-base text-gray-600 mt-4 leading-relaxed">
                  The range you see reflects what most homeowners in your situation actually pay for complete, professional installations. We explain what can move pricing within that range—like efficiency choices, optional upgrades, or installation complexity—so you understand the full picture.
                </p>
                <p className="text-base text-gray-600 mt-4 leading-relaxed">
                  Final pricing is always confirmed after an on-site evaluation. This estimate sets realistic expectations, not false promises.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Ready to see your estimate?
            </h3>
            <p className="text-base text-gray-600 mb-6 max-w-2xl mx-auto">
              Get started with a realistic price range based on your home and preferences. No commitment required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/homeowner/h1"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
              >
                Get My Estimate
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Back to Home
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}



