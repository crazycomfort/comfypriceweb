"use client";

import { useState, useEffect } from "react";
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
];

export default function HomeownerH7() {
  const router = useRouter();
  const [interpretation, setInterpretation] = useState<any>(null);

  // Load user's choices
  useEffect(() => {
    const saved = sessionStorage.getItem("homeownerEstimateInput");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInterpretation(parsed);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={7} totalSteps={7} stepLabels={STEPS} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Step 7: Long-Term Ownership Considerations
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Understanding how your choices affect operating costs, reliability, maintenance needs, and system lifespan helps you make informed decisions.
          </p>
        </div>

        {/* Monthly Operating Costs Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Operating Costs</h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            Energy bills vary based on system efficiency, home size, and local climate. Higher efficiency systems typically use less energy, which reduces monthly operating costs over time.
          </p>
          
          {interpretation?.preferences?.efficiencyLevel && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Based on your efficiency choice:</strong>{" "}
                {interpretation.preferences.efficiencyLevel === "premium"
                  ? "Best efficiency systems typically reduce monthly energy costs by 30–40% compared to standard efficiency systems, though upfront costs are higher."
                  : interpretation.preferences.efficiencyLevel === "standard"
                  ? "Better efficiency systems typically reduce monthly energy costs by 20–25% compared to standard efficiency systems, providing a balance between upfront cost and long-term savings."
                  : "Good efficiency systems keep upfront costs lower but result in higher monthly energy bills compared to higher efficiency options."}
              </p>
            </div>
          )}

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>• Operating costs are relative to your home size, local energy rates, and usage patterns</p>
            <p>• Higher efficiency systems reduce energy consumption, which lowers monthly bills</p>
            <p>• Actual costs depend on your home's insulation, windows, and how you use your system</p>
          </div>
        </div>

        {/* Reliability & Repair Frequency Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reliability & Repair Frequency</h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            System reliability depends on equipment quality, installation quality, and maintenance. Most modern HVAC systems are designed to operate reliably for many years with proper care.
          </p>
          
          <div className="space-y-3">
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Typical experience:</strong> Most homeowners experience occasional repairs during a system's lifespan. Common issues include capacitor replacements, refrigerant leaks, or sensor failures—these are normal wear items, not system failures.
              </p>
            </div>
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Installation quality matters:</strong> Professional installation following manufacturer specifications significantly reduces the likelihood of early failures or frequent repairs.
              </p>
            </div>
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Higher efficiency systems:</strong> Often include more advanced components, which can mean more complex repairs when needed, but they're typically designed for long-term reliability.
              </p>
            </div>
          </div>
        </div>

        {/* Maintenance Commitment Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Maintenance Commitment</h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            Regular maintenance helps systems operate efficiently and reliably. Understanding what's involved helps you plan for ongoing care.
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2 text-sm">Annual maintenance typically includes:</h3>
              <ul className="space-y-2 text-sm text-gray-700 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Filter replacement (every 1–3 months, depending on system and home)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Professional inspection and cleaning (annually, typically before heating or cooling season)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Checking refrigerant levels, electrical connections, and system performance</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">What to expect:</strong> Most homeowners schedule annual professional maintenance. Some choose maintenance plans that include priority service and discounts on repairs. Maintenance helps prevent unexpected breakdowns and keeps systems running efficiently.
              </p>
            </div>
          </div>
        </div>

        {/* Expected System Lifespan Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Expected System Lifespan</h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            System lifespan varies based on equipment quality, installation quality, maintenance, and usage patterns. These are general ranges based on typical experience.
          </p>
          
          <div className="space-y-3">
            {interpretation?.preferences?.systemType && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-700 mb-2">
                  <strong className="text-gray-900">Based on your system type:</strong>
                </p>
                <p className="text-sm text-gray-700">
                  {interpretation.preferences.systemType === "central-air"
                    ? "Central air conditioning systems typically last 12–15 years with proper maintenance. Heat pumps and dual-fuel systems often have similar lifespans, though individual components may need replacement at different intervals."
                    : interpretation.preferences.systemType === "heat-pump"
                    ? "Heat pump systems typically last 12–15 years with proper maintenance. Because they operate year-round for both heating and cooling, usage patterns can affect lifespan."
                    : "Dual-fuel systems typically last 12–15 years with proper maintenance. The heat pump and furnace components may have different replacement timelines based on usage."}
                </p>
              </div>
            )}
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Lifespan ranges reflect typical experience with professional installation and regular maintenance</p>
              <p>• Systems may need component replacements (like compressors or heat exchangers) before full system replacement</p>
              <p>• Actual lifespan depends on usage intensity, maintenance quality, and environmental factors</p>
            </div>
          </div>
        </div>

        {/* Resale & Peace of Mind Section - Optional */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resale & Peace of Mind</h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            A well-maintained, efficient HVAC system can be a selling point for your home. Buyers often appreciate systems that are relatively new, efficient, and in good working condition.
          </p>
          
          <div className="space-y-3">
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Home value consideration:</strong> Modern, efficient HVAC systems can be viewed positively by potential buyers, though the impact on home value varies by market and buyer priorities.
              </p>
            </div>
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Warranty coverage:</strong> Most new systems include manufacturer warranties on parts and sometimes labor. Extended warranties may be available and can provide peace of mind during the early years of ownership.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Summary Box */}
        {interpretation && (
          <div className="bg-primary-50 rounded-xl border border-primary-200 p-6 md:p-8 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary for your situation</h3>
            <div className="space-y-3 text-sm text-gray-700">
              {interpretation.preferences?.efficiencyLevel && (
                <p>
                  <strong className="text-gray-900">Efficiency choice:</strong>{" "}
                  {interpretation.preferences.efficiencyLevel === "premium"
                    ? "Best efficiency systems typically provide the lowest long-term operating costs and improved reliability, with higher upfront investment."
                    : interpretation.preferences.efficiencyLevel === "standard"
                    ? "Better efficiency systems provide a balance between upfront cost and long-term energy savings, suitable for most homeowners."
                    : "Good efficiency systems keep upfront costs lower, with higher monthly energy bills over the system's lifespan."}
                </p>
              )}
              {interpretation.preferences?.systemType && (
                <p>
                  <strong className="text-gray-900">System type:</strong>{" "}
                  {interpretation.preferences.systemType === "central-air"
                    ? "Cooling-only systems typically have straightforward maintenance needs and operate during the cooling season."
                    : interpretation.preferences.systemType === "heat-pump"
                    ? "Heat pump systems operate year-round for both heating and cooling, which means more usage but also more consistent climate control."
                    : "Dual-fuel systems provide maximum performance in cold climates, with both heat pump and gas furnace components requiring maintenance."}
                </p>
              )}
              {interpretation.squareFootage && (
                <p>
                  <strong className="text-gray-900">Home size:</strong>{" "}
                  {interpretation.squareFootage >= 3000
                    ? "Larger homes typically have higher operating costs due to greater heating and cooling loads, regardless of system efficiency."
                    : "Standard-sized homes typically have moderate operating costs that are manageable with proper system sizing and efficiency choices."}
                </p>
              )}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 text-center mt-6 mb-4">
          This is educational information. You're not committing to anything.
        </p>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/homeowner/h6"
            className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
          <button
            onClick={() => router.push("/homeowner/h6")}
            type="button"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          >
            Continue to Review
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}

