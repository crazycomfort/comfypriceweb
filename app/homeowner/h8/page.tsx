"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressIndicator from "@/app/components/ProgressIndicator";

const STEPS = [
  "Location",
  "Home Basics",
  "Current System",
  "Preferences",
  "Review",
  "Estimate",
  "Ownership",
  "Trust",
];

export default function HomeownerH8() {
  const router = useRouter();

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={8} totalSteps={8} stepLabels={STEPS} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Step 8: Trust & Transparency
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Understanding how this estimate works and what you can expect helps you make informed decisions with confidence.
          </p>
        </div>

        {/* How Estimates Are Generated Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How estimates are generated</h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            Your estimate range is calculated using regional pricing data, typical installation scenarios, and the information you provided about your home and preferences.
          </p>
          
          <div className="space-y-3">
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Regional factors:</strong> Labor rates, local code requirements, and equipment availability in your area influence pricing. Your ZIP code helps anchor the estimate to realistic regional costs.
              </p>
            </div>
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Home characteristics:</strong> Your home's size, age, and layout affect system capacity requirements and installation complexity, which influence the estimate range.
              </p>
            </div>
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Your preferences:</strong> Efficiency level, system type, and feature choices move the estimate within realistic ranges based on typical installations in your area.
              </p>
            </div>
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Range, not exact price:</strong> The estimate shows a range because final costs depend on site-specific conditions that can only be evaluated in person. This range reflects typical scenarios, not edge cases.
              </p>
            </div>
          </div>
        </div>

        {/* What This Tool Does NOT Do Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What this tool does not do</h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            This estimate is designed to inform, not persuade. Understanding what we don't do helps clarify our purpose.
          </p>
          
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">We don't sell your data:</strong> Your information is used only to generate your estimate. We don't share your data with contractors, advertisers, or third parties without your explicit consent.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">We don't use pressure tactics:</strong> You won't see urgency language, limited-time offers, or "act now" messaging. This estimate is available when you're ready to review it.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">We don't use bait-and-switch pricing:</strong> The range you see reflects realistic expectations for typical installations. We don't show artificially low prices that exclude essential work or equipment.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">We don't require commitment:</strong> This estimate is for planning and education. You can save it, share it, or come back to it later. Nothing here locks you into anything.
              </p>
            </div>
          </div>
        </div>

        {/* Homeowner Outcome Quotes Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What homeowners say</h2>
          <p className="text-sm text-gray-600 mb-6">
            These are general experiences homeowners have shared about using this type of estimate tool.
          </p>
          
          <div className="space-y-4">
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700 italic mb-2">
                "Having a realistic range before talking to contractors helped me ask better questions and feel more confident in the conversation."
              </p>
              <p className="text-xs text-gray-500">— Homeowner, Midwest</p>
            </div>
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700 italic mb-2">
                "I appreciated that there was no pressure to move forward. I could take my time and review the information with my partner."
              </p>
              <p className="text-xs text-gray-500">— Homeowner, Southeast</p>
            </div>
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700 italic mb-2">
                "The explanations helped me understand why certain choices cost more, which made the decision process clearer."
              </p>
              <p className="text-xs text-gray-500">— Homeowner, West Coast</p>
            </div>
          </div>
        </div>

        {/* Contractor Standards & Homeowner Protections Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contractor standards and homeowner protections</h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            When you're ready to work with a contractor, understanding what to expect helps protect your interests and ensures quality work.
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2 text-sm">What to look for:</h3>
              <ul className="space-y-2 text-sm text-gray-700 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Licensed and insured contractors with proper credentials for your area</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Written estimates that detail equipment, labor, and materials separately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Clear warranty terms covering both parts and labor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>References or reviews from previous customers in your area</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong className="text-gray-900">Your rights as a homeowner:</strong>
              </p>
              <p className="text-sm text-gray-700">
                You have the right to get multiple estimates, ask questions about equipment and installation methods, review contracts before signing, and understand warranty coverage. A reputable contractor will provide clear information and answer your questions without pressure.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong className="text-gray-900">This estimate helps you:</strong>
              </p>
              <p className="text-sm text-gray-700">
                Having a realistic range in hand helps you identify estimates that are significantly outside normal ranges, ask informed questions about what affects pricing, and feel more confident in contractor conversations.
              </p>
            </div>
          </div>
        </div>

        {/* Reassurance Section */}
        <div className="bg-primary-50 rounded-xl border border-primary-200 p-6 md:p-8 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">You're in control</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              This estimate is a planning tool, not a commitment. You can review it, save it, share it with someone you trust, or come back to it later. When you're ready to move forward, you'll have realistic expectations and can make informed decisions.
            </p>
            <p>
              Final pricing always depends on an on-site evaluation. This estimate helps you understand what to expect, so you can have productive conversations with contractors when you're ready.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/homeowner/h7"
            className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
          <p className="text-sm text-gray-500 text-center mb-4">
            This is just information. Use this to understand your options.
          </p>
          <button
            onClick={() => router.push("/homeowner/h6")}
            type="button"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          >
            Continue to review your estimate
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}

