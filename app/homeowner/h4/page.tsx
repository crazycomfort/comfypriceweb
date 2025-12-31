"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressIndicator from "@/app/components/ProgressIndicator";
import HelpTooltip from "@/app/components/HelpTooltip";
import ErrorMessage from "@/app/components/ErrorMessage";

const STEPS = [
  "Location",
  "Home Basics",
  "Current System",
  "Preferences",
  "Review",
];

export default function HomeownerH4() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    efficiency: "",
    systemPreference: "",
    smartFeatures: "",
    financingInterest: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFinancing, setShowFinancing] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("homeownerEstimateInput");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Only override defaults if saved data exists
      if (parsed.preferences) {
        setFormData({
          efficiency: parsed.preferences?.efficiencyLevel || "standard",
          systemPreference: parsed.preferences?.systemType || "central-air",
          smartFeatures: parsed.preferences?.smartFeatures ? "yes" : parsed.preferences?.smartFeatures === false ? "no" : "",
          financingInterest: parsed.preferences?.financingInterest || false,
        });
      }
    } else {
      // Save defaults to sessionStorage
      const allData = {
        preferences: {
          efficiencyLevel: "standard",
          systemType: "central-air",
          smartFeatures: false,
          financingInterest: false,
        },
      };
      sessionStorage.setItem("homeownerEstimateInput", JSON.stringify(allData));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fieldName = e.target.name;
    const value = e.target.value;
    
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    
    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);

    const allData = {
      ...JSON.parse(sessionStorage.getItem("homeownerEstimateInput") || "{}"),
      preferences: {
        efficiencyLevel: newData.efficiency,
        systemType: newData.systemPreference,
        smartFeatures: newData.smartFeatures === "yes",
        financingInterest: newData.financingInterest,
      },
    };
    sessionStorage.setItem("homeownerEstimateInput", JSON.stringify(allData));
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.efficiency) {
      newErrors.efficiency = "Please select an efficiency level";
    }
    if (!formData.systemPreference) {
      newErrors.systemPreference = "Please select a system type";
    }
    if (!formData.smartFeatures) {
      newErrors.smartFeatures = "Please indicate interest in smart features";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    router.push("/homeowner/h5");
  };

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={4} totalSteps={5} stepLabels={STEPS} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-section text-gray-900 mb-2">
            Step 4: Your Comfort Priorities
          </h1>
          <p className="text-body text-gray-600 max-w-2xl mx-auto mb-4">
            These choices don't lock anything in. They simply adjust the estimate to reflect common homeowner priorities.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-8">

          <div>
            <label htmlFor="efficiency" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              Upfront cost vs. monthly savings <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Higher efficiency systems cost more upfront but reduce monthly energy bills. Standard systems keep initial costs lower but increase monthly expenses.
            </p>
            <select
              id="efficiency"
              name="efficiency"
              value={formData.efficiency}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white ${
                errors.efficiency ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            >
              <option value="">Choose your priority...</option>
              <option value="basic">Good</option>
              <option value="standard">Better</option>
              <option value="premium">Best</option>
            </select>
            {formData.efficiency && (
              <div className="mt-3 space-y-2">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {formData.efficiency === "premium" 
                      ? "Best"
                      : formData.efficiency === "standard"
                      ? "Better"
                      : "Good"}
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    {formData.efficiency === "premium" 
                      ? "SEER 17+"
                      : formData.efficiency === "standard"
                      ? "SEER 15-16"
                      : "SEER 13-14"}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    {formData.efficiency === "premium" 
                      ? "Who this is for: Homeowners prioritizing lowest long-term energy spend and maximum reliability."
                      : formData.efficiency === "standard"
                      ? "Who this is for: Most homeowners seeking a balanced choice between upfront cost and long-term savings."
                      : "Who this is for: Homeowners prioritizing lowest upfront cost and comfortable with higher monthly energy bills."}
                  </p>
                  <p className="text-sm text-gray-800">
                    {formData.efficiency === "premium" 
                      ? "Highest upfront cost, lowest long-term energy spend. Typically moves the estimate toward the higher end of the range but reduces monthly energy costs by 30–40% over time. Most installations in this range include extended warranties and improved long-term reliability."
                      : formData.efficiency === "standard"
                      ? "Balanced choice for most homeowners. Typically moves the estimate toward the middle of the range and reduces monthly energy bills by 20–25%. Most installations in this range include quality equipment with standard warranties."
                      : "Lowest upfront cost, higher monthly energy bills. Typically moves the estimate toward the lower end of the range but results in higher monthly energy bills over time. Most installations in this range include reliable equipment with basic warranties."}
                  </p>
                </div>
              </div>
            )}
            {errors.efficiency && (
              <div className="mt-2">
                <ErrorMessage message={errors.efficiency} type="error" />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="systemPreference" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              Heating and cooling needs <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Your choice affects the estimate range based on whether you need cooling only, or both heating and cooling in one system.
            </p>
            <select
              id="systemPreference"
              name="systemPreference"
              value={formData.systemPreference}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white ${
                errors.systemPreference ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            >
              <option value="central-air">Cooling only (Most Common Choice)</option>
              <option value="heat-pump">Heating and cooling in one system</option>
              <option value="dual-fuel">Maximum efficiency for cold climates</option>
            </select>
            {errors.systemPreference && (
              <div className="mt-2">
                <ErrorMessage message={errors.systemPreference} type="error" />
              </div>
            )}
            {formData.systemPreference && (
              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                {formData.systemPreference === "central-air" && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Why would I choose this?</p>
                      <p className="text-sm text-gray-700">
                        You already have a separate heating system (furnace, boiler, or electric heat) that works well, and you only need to replace your cooling system. This keeps upfront costs lower since you're replacing one system instead of two.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">Cost impact:</p>
                      <p className="text-sm text-gray-800">
                        Cooling-only systems typically fall toward the lower to middle end of the range. Most installations in this range include complete system replacement with professional installation.
                      </p>
                    </div>
                  </>
                )}
                {formData.systemPreference === "heat-pump" && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Why would I choose this?</p>
                      <p className="text-sm text-gray-700">
                        You need both heating and cooling, and you want one system that handles both. Heat pumps provide all-in-one climate control, which can be more efficient than separate systems. This option typically costs more upfront than cooling-only because it replaces both your heating and cooling systems, but it simplifies your home's climate control into one system.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">Cost impact:</p>
                      <p className="text-sm text-gray-800">
                        Heating and cooling systems typically move the estimate toward the middle to higher end of the range because they provide complete climate control in one system. Most installations in this range include both heating and cooling capabilities.
                      </p>
                    </div>
                  </>
                )}
                {formData.systemPreference === "dual-fuel" && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Why would I choose this?</p>
                      <p className="text-sm text-gray-700">
                        You live in a climate with very cold winters where a heat pump alone may struggle, and you want maximum efficiency year-round. Dual-fuel systems combine a heat pump with a gas furnace, automatically switching between them based on outside temperature. This provides the best performance in extreme cold while maintaining efficiency in milder weather.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">Cost impact:</p>
                      <p className="text-sm text-gray-800">
                        Maximum efficiency systems typically move the estimate toward the higher end of the range because they include both heat pump and gas furnace equipment. Most installations in this range provide optimal performance in cold climates.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              Thermostat preference <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Smart thermostats provide better comfort control and energy visibility, but add to the upfront cost. This preference doesn't lock you into a specific brand—you can discuss options with your contractor.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: "no", label: "Standard thermostat", description: "Basic temperature control" },
                { value: "yes", label: "Smart thermostat & remote control", description: "Wi-Fi enabled with app control and energy insights" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.smartFeatures === option.value
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="smartFeatures"
                    value={option.value}
                    checked={formData.smartFeatures === option.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className={`font-medium text-center mb-1 ${
                    formData.smartFeatures === option.value ? "text-primary-700" : "text-gray-900"
                  }`}>
                    {option.label}
                  </span>
                  <span className={`text-xs text-center ${
                    formData.smartFeatures === option.value ? "text-primary-600" : "text-gray-600"
                  }`}>
                    {option.description}
                  </span>
                </label>
              ))}
            </div>
            {errors.smartFeatures && (
              <div className="mt-2">
                <ErrorMessage message={errors.smartFeatures} type="error" />
              </div>
            )}
            {formData.smartFeatures && (
              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                {formData.smartFeatures === "yes" ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Why would I choose this?</p>
                      <p className="text-sm text-gray-700">
                        Smart thermostats let you control your home's temperature from anywhere using your phone, provide visibility into your energy usage, and can automatically adjust settings to save energy. This preference doesn't lock you into a specific brand—you can discuss available options with your contractor.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">Cost impact:</p>
                      <p className="text-sm text-gray-800">
                        Smart thermostats typically move the estimate toward the higher end of the range but improve comfort control and can reduce monthly energy bills by 10–15%. Most installations in this range include Wi-Fi thermostats when selected.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Why would I choose this?</p>
                      <p className="text-sm text-gray-700">
                        Standard thermostats provide reliable temperature control without the added cost of smart features. This keeps upfront costs toward the lower end of the range while still maintaining comfortable home temperatures.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">Cost impact:</p>
                      <p className="text-sm text-gray-800">
                        Standard thermostats typically keep the estimate toward the lower end of the range. Most installations in this range include reliable basic temperature control.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Navigation */}
        <p className="text-sm text-gray-500 text-center mt-6 mb-4">
          This is just information to help you understand your options. No sales pressure.
        </p>

        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/homeowner/h3"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline-offset-4 hover:underline"
          >
            Back
          </Link>
          <button
            onClick={handleNext}
            type="button"
            disabled={!formData.efficiency || !formData.systemPreference || !formData.smartFeatures}
            className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-lg cursor-pointer"
          >
            Continue
          </button>
        </div>

        {/* Financing Options - Collapsed by Default */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => setShowFinancing(!showFinancing)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Optional planning support</p>
              <p className="text-xs text-gray-600 mt-1">Not a commitment</p>
            </div>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${showFinancing ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showFinancing && (
            <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-700 mb-4">
                    Many homeowners use financing to spread the upfront cost over time. This is optional planning support to help you understand affordability—not a commitment.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="financing-interest"
                    name="financingInterest"
                    checked={formData.financingInterest}
                    onChange={(e) => {
                      const newData = { ...formData, financingInterest: e.target.checked };
                      setFormData(newData);
                      const allData = {
                        ...JSON.parse(sessionStorage.getItem("homeownerEstimateInput") || "{}"),
                        preferences: {
                          efficiencyLevel: newData.efficiency,
                          systemType: newData.systemPreference,
                          smartFeatures: newData.smartFeatures === "yes",
                          financingInterest: newData.financingInterest,
                        },
                      };
                      sessionStorage.setItem("homeownerEstimateInput", JSON.stringify(allData));
                    }}
                    className="mt-1 w-5 h-5 text-primary-700 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="financing-interest" className="text-sm font-medium text-gray-900 cursor-pointer block">
                      I'd like to see estimated monthly payment ranges
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    Final terms depend on contractor and credit approval. This selection doesn't affect your estimate range.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
