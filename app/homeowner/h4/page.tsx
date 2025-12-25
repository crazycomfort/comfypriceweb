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

  useEffect(() => {
    const saved = sessionStorage.getItem("homeownerEstimateInput");
    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData({
        efficiency: parsed.preferences?.efficiencyLevel || "",
        systemPreference: parsed.preferences?.systemType || "",
        smartFeatures: parsed.preferences?.smartFeatures ? "yes" : parsed.preferences?.smartFeatures === false ? "no" : "",
        financingInterest: parsed.preferences?.financingInterest || false,
      });
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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={4} totalSteps={5} stepLabels={STEPS} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Step 4: Preferences
          </h1>
          <p className="text-lg text-gray-600">
            Choose your desired system features and efficiency level
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-6">
          <div>
            <label htmlFor="efficiency" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              Desired Efficiency Level <span className="text-red-500">*</span>
              <HelpTooltip content="SEER (Seasonal Energy Efficiency Ratio) measures cooling efficiency. Higher SEER ratings mean lower energy bills but higher upfront costs. SEER 13-14 is standard, 15-16 is good, and 17+ is premium efficiency." />
            </label>
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
              <option value="">Select efficiency level...</option>
              <option value="basic">Basic - Standard efficiency (SEER 13-14)</option>
              <option value="standard">Standard - Good efficiency (SEER 15-16)</option>
              <option value="premium">Premium - High efficiency (SEER 17+)</option>
            </select>
            {errors.efficiency && (
              <div className="mt-2">
                <ErrorMessage message={errors.efficiency} type="error" />
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Higher efficiency systems cost more upfront but save on energy bills
            </p>
          </div>

          <div>
            <label htmlFor="systemPreference" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              System Type Preference <span className="text-red-500">*</span>
              <HelpTooltip content="Central Air provides cooling only. Heat Pumps provide both heating and cooling efficiently. Dual Fuel combines a heat pump with a gas furnace for maximum efficiency in cold climates." />
            </label>
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
              <option value="">Select system type...</option>
              <option value="central-air">Central Air Conditioning</option>
              <option value="heat-pump">Heat Pump (Heating & Cooling)</option>
              <option value="dual-fuel">Dual Fuel System</option>
            </select>
            {errors.systemPreference && (
              <div className="mt-2">
                <ErrorMessage message={errors.systemPreference} type="error" />
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              Smart Features Interest <span className="text-red-500">*</span>
              <HelpTooltip content="Smart thermostats and Wi-Fi controls allow you to manage your HVAC system remotely, create schedules, and optimize energy usage. They can save 10-15% on energy bills." />
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "yes", label: "Yes, I'm interested" },
                { value: "no", label: "No, not needed" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.smartFeatures === option.value
                      ? "border-primary-600 bg-primary-50 text-primary-700"
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
                  <span className="font-medium text-center">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.smartFeatures && (
              <div className="mt-2">
                <ErrorMessage message={errors.smartFeatures} type="error" />
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Smart thermostats and Wi-Fi controls for better energy management
            </p>
          </div>

          {/* Financing Options */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-start gap-3 p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border-2 border-primary-200">
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
                <label htmlFor="financing-interest" className="text-base font-semibold text-gray-900 cursor-pointer block mb-2">
                  I'm interested in financing options
                </label>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="font-medium">Available financing options:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>0% APR</strong> for 12-24 months (qualifying customers)</li>
                    <li><strong>Low monthly payments</strong> starting as low as $99/month</li>
                    <li><strong>No credit check</strong> required for pre-qualification</li>
                    <li><strong>Flexible terms</strong> from 12 to 120 months</li>
                    <li><strong>Quick approval</strong> - often same-day decisions</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-2 italic">
                    Financing options vary by creditworthiness and project size. Our team will work with you to find the best solution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/homeowner/h3"
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
            disabled={!formData.efficiency || !formData.systemPreference || !formData.smartFeatures}
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:transform-none cursor-pointer"
          >
            Continue
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
