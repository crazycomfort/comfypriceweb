"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressIndicator from "@/app/components/ProgressIndicator";
import { isFeatureEnabled } from "@/lib/feature-flags";
import HelpTooltip from "@/app/components/HelpTooltip";

const STEPS = [
  "Location",
  "Home Basics",
  "Current System",
  "Preferences",
  "Review",
];

export default function HomeownerH5() {
  const router = useRouter();
  const detailedEstimateEnabled = isFeatureEnabled("detailedEstimate");
  const [formData, setFormData] = useState({
    accessDifficulty: "",
    permits: "",
    timeline: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      // Collect all form data from session storage
      const existingData = sessionStorage.getItem("homeownerEstimateInput");
      if (!existingData) {
        alert("Form data lost. Please start over from the beginning.");
        router.push("/homeowner/h1");
        return;
      }

      const allData = {
        ...JSON.parse(existingData),
        installationFactors: formData,
      };

      // Validate before proceeding
      const { validateHomeownerInput } = await import("@/lib/form-validation");
      const errors = validateHomeownerInput(allData);
      
      if (errors.length > 0) {
        const errorMessage = errors.map(e => e.message).join("\n");
        alert(`Please complete all required fields:\n${errorMessage}`);
        setIsSubmitting(false);
        return;
      }

      sessionStorage.setItem("homeownerEstimateInput", JSON.stringify(allData));
      router.push("/homeowner/h6");
    } catch (error) {
      console.error("Error saving form data:", error);
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={5} totalSteps={5} stepLabels={STEPS} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Step 5: Installation Factors
          </h1>
          <p className="text-lg text-gray-600">
            Help us understand installation complexity (optional)
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-6">
          <div>
            <label htmlFor="accessDifficulty" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              Access Difficulty
              <HelpTooltip content="Difficult access (tight spaces, high roofs, etc.) may require additional equipment or time, which can affect labor costs. Standard installations are typically straightforward." />
            </label>
            <select
              id="accessDifficulty"
              name="accessDifficulty"
              value={formData.accessDifficulty}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white"
            >
              <option value="">Select access difficulty...</option>
              <option value="easy">Easy - Standard installation</option>
              <option value="average">Average - Some complexity</option>
              <option value="difficult">Difficult - Complex installation</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              How difficult is it to access the installation area?
            </p>
          </div>

          <div>
            <label htmlFor="permits" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              Permit Requirements
              <HelpTooltip content="Many municipalities require permits for HVAC installations. Permit costs and requirements vary by location and may add to the total project cost." />
            </label>
            <select
              id="permits"
              name="permits"
              value={formData.permits}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white"
            >
              <option value="">Select permit status...</option>
              <option value="yes">Yes, permits required</option>
              <option value="no">No permits needed</option>
              <option value="unknown">Unknown</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Some installations require local permits and inspections
            </p>
          </div>

          <div>
            <label htmlFor="timeline" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              Timeline Preferences
              <HelpTooltip content="Urgent installations may have higher costs due to rush scheduling. Planning ahead allows for better pricing and scheduling flexibility." />
            </label>
            <select
              id="timeline"
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white"
            >
              <option value="">Select timeline...</option>
              <option value="urgent">Urgent (within 1 month)</option>
              <option value="soon">Soon (1-3 months)</option>
              <option value="planning">Planning (3-6 months)</option>
              <option value="future">Future (6+ months)</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              When are you planning to install the system?
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/homeowner/h4"
            className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
          <button
            onClick={handleNext}
            type="button"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:transform-none cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                Get My Estimate
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
