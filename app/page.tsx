import Link from "next/link";
import Logo from "@/app/components/Logo";
import PageSection from "@/app/components/PageSection";
import { PrimarySection } from "@/app/components/SectionHierarchy";

export default async function LandingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Top Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Logo size="md" variant="light-bg" />
            </Link>
            <Link
              href="/education"
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              Education
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Homeowner-First */}
      <PrimarySection background="gradient" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.08),transparent_50%)]"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-center py-20 md:py-28">
            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
              COMFYprice
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-slate-700 mb-4 leading-relaxed font-medium max-w-2xl mx-auto">
              Know the real cost of HVAC replacement before you talk to anyone.
            </p>
            
            {/* Supporting line */}
            <p className="text-base md:text-lg text-slate-600 mb-12 leading-relaxed max-w-xl mx-auto">
              Clear pricing ranges. Plain-language explanations. No sales pressure.
            </p>

            {/* PRIMARY CTA */}
            <div className="flex flex-col items-center gap-3 mb-16">
              <Link
                href="/homeowner/h1"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-lg shadow-lg hover:shadow-xl min-w-[240px]"
              >
                Get My Price Range
              </Link>
              <p className="text-sm text-slate-500">
                Takes about 2 minutes • No contact required
              </p>
            </div>
          </div>
        </div>
      </PrimarySection>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm py-12">
        <PageSection>
          <div className="text-center space-y-6">
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl mx-auto">
              COMFYprice is a decision-support estimate, not a final bid. Final pricing may vary by site conditions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-500">
              <span>© {new Date().getFullYear()} COMFYprice. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <Link
                href="/contractor"
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Contractor access
              </Link>
            </div>
          </div>
        </PageSection>
      </footer>
    </main>
  );
}
