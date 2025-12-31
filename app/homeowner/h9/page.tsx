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
  "Trust",
  "Summary",
];

export default function HomeownerH9() {
  const router = useRouter();
  const [interpretation, setInterpretation] = useState<any>(null);
  const [estimateRange, setEstimateRange] = useState<{ min: number; max: number } | null>(null);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load user's choices and generate estimate
  useEffect(() => {
    const saved = sessionStorage.getItem("homeownerEstimateInput");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInterpretation(parsed);
        
        // Generate estimate range if we have required data
        if (parsed.zipCode && parsed.squareFootage && parsed.floors && parsed.homeAge && 
            parsed.preferences?.efficiencyLevel && parsed.preferences?.systemType) {
          generateEstimateRange(parsed);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const generateEstimateRange = async (data: any) => {
    setIsLoadingEstimate(true);
    try {
      const response = await fetch("/api/homeowner/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zipCode: data.zipCode,
          squareFootage: data.squareFootage,
          floors: data.floors,
          homeAge: data.homeAge,
          existingSystem: data.existingSystem || {},
          preferences: {
            efficiencyLevel: data.preferences?.efficiencyLevel,
            systemType: data.preferences?.systemType,
            smartFeatures: data.preferences?.smartFeatures || false,
          },
          installationFactors: data.installationFactors || {},
        }),
      });

      if (response.ok) {
        const estimate = await response.json();
        if (estimate.range) {
          setEstimateRange({
            min: estimate.range.min,
            max: estimate.range.max,
          });
        }
      }
    } catch (error) {
      console.error("Error generating estimate range:", error);
    } finally {
      setIsLoadingEstimate(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSave = () => {
    try {
      const saved = sessionStorage.getItem("homeownerEstimateInput");
      if (saved) {
        localStorage.setItem("homeownerEstimateSaved", saved);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving estimate:", error);
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={9} totalSteps={9} stepLabels={STEPS} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Step 9: Estimate Review
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Review your estimate summary and understand what happens next. You're in control of how and when you proceed.
          </p>
        </div>

        {/* Project Summary Section */}
        {interpretation && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Summary</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-primary-600 mt-1">•</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Project type:</strong>{" "}
                    {interpretation.preferences?.systemType === "central-air"
                      ? "Cooling system replacement"
                      : interpretation.preferences?.systemType === "heat-pump"
                      ? "Heat pump system replacement (heating and cooling)"
                      : "Dual-fuel system replacement (maximum efficiency)"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-primary-600 mt-1">•</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Home context:</strong>{" "}
                    {interpretation.squareFootage && (
                      <>
                        {interpretation.squareFootage >= 4000
                          ? "4,000+ square feet"
                          : interpretation.squareFootage >= 3000
                          ? "3,000–3,999 square feet"
                          : interpretation.squareFootage >= 2500
                          ? "2,500–2,999 square feet"
                          : interpretation.squareFootage >= 2000
                          ? "2,000–2,499 square feet"
                          : "Under 2,000 square feet"}
                        {interpretation.floors > 1 && `, ${interpretation.floors}-story home`}
                        {interpretation.homeAge && (interpretation.homeAge === "old" || interpretation.homeAge === "30+" || interpretation.homeAge === "20-30") && ", older home"}
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-primary-600 mt-1">•</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Region:</strong>{" "}
                    ZIP code {interpretation.zipCode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Price Range Display */}
        {estimateRange && (
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg border border-primary-500 p-8 md:p-10 mb-6 text-white">
            <div className="text-center">
              <p className="text-sm text-primary-100 uppercase tracking-wider mb-3 font-semibold">
                Estimated Planning Range
              </p>
              <div className="text-5xl md:text-6xl font-bold mb-4">
                {formatCurrency(estimateRange.min)} – {formatCurrency(estimateRange.max)}
              </div>
              <p className="text-base text-primary-100 max-w-2xl mx-auto">
                This range reflects typical installations in your area based on your home and preferences. Final pricing requires an on-site evaluation.
              </p>
            </div>
          </div>
        )}

        {isLoadingEstimate && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-6">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary-200 border-t-primary-600 mb-4"></div>
              <p className="text-sm text-gray-600">Calculating your estimate range...</p>
            </div>
          </div>
        )}

        {/* Good/Better/Best Recap */}
        {interpretation?.preferences?.efficiencyLevel && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your efficiency choice</h2>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong className="text-gray-900">
                  {interpretation.preferences.efficiencyLevel === "premium"
                    ? "Best efficiency"
                    : interpretation.preferences.efficiencyLevel === "standard"
                    ? "Better efficiency"
                    : "Good efficiency"}
                </strong>
              </p>
              <p className="text-sm text-gray-700">
                {interpretation.preferences.efficiencyLevel === "premium"
                  ? "Higher upfront cost, lowest long-term energy spend. Typically reduces monthly energy costs by 30–40% compared to standard efficiency."
                  : interpretation.preferences.efficiencyLevel === "standard"
                  ? "Balanced choice for most homeowners. Typically reduces monthly energy bills by 20–25% compared to standard efficiency."
                  : "Lower upfront cost, higher monthly energy bills. Keeps initial investment more manageable while still providing reliable comfort."}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Not sure if this is right? Many homeowners start with Better efficiency for a balance of comfort and long-term value, but there's no wrong choice.
            </p>
          </div>
        )}

        {/* What Happens Next Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What happens next</h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            When you're ready to move forward, here's what you can expect:
          </p>
          
          <div className="space-y-3">
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">On-site evaluation:</strong> A professional will visit your home to assess existing infrastructure, access points, and site conditions. This evaluation determines the final pricing and installation scope.
              </p>
            </div>
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Written estimate:</strong> You'll receive a detailed written estimate that breaks down equipment, labor, and materials. This allows you to compare options and ask questions.
              </p>
            </div>
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">No pressure:</strong> Take your time to review estimates, ask questions, and make decisions. Reputable contractors understand that this is a significant investment and respect your timeline.
              </p>
            </div>
          </div>
        </div>

        {/* Ownership Section */}
        <div className="bg-primary-50 rounded-xl border border-primary-200 p-6 md:p-8 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">You own this estimate</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              This estimate is yours to save, share, or review whenever you need it. You can save it to your device, share it with a partner or family member, or come back to it later.
            </p>
            <p>
              Nothing here locks you into anything. When you're ready to talk to contractors, you'll have realistic expectations and can make informed decisions.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link
            href="/homeowner/h8"
            className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
          
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {saved ? "Saved!" : "Save & share"}
            </button>
            
            <p className="text-sm text-gray-500 text-center mb-4">
              This is informational. Nothing here is binding.
            </p>
            <button
              onClick={() => router.push("/homeowner/h6")}
              type="button"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            >
              Continue
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

