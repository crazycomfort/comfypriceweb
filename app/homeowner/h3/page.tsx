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
];

export default function HomeownerH3() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    hasExisting: "",
    systemType: "",
    systemAge: "",
    condition: "",
    replacementReason: "",
    howTheyKnow: [] as string[],
  });

  useEffect(() => {
    const saved = sessionStorage.getItem("homeownerEstimateInput");
    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData({
        hasExisting: parsed.existingSystem?.hasExisting ? "yes" : parsed.existingSystem?.hasExisting === false ? "no" : "",
        systemType: parsed.existingSystem?.systemType || "",
        systemAge: parsed.existingSystem?.systemAge || "",
        condition: parsed.existingSystem?.condition || "",
        replacementReason: parsed.existingSystem?.replacementReason || "",
        howTheyKnow: Array.isArray(parsed.existingSystem?.howTheyKnow) 
          ? parsed.existingSystem.howTheyKnow 
          : parsed.existingSystem?.howTheyKnow 
            ? [parsed.existingSystem.howTheyKnow] 
            : [],
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }) => {
    const newData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newData);

    const allData = {
      ...JSON.parse(sessionStorage.getItem("homeownerEstimateInput") || "{}"),
      existingSystem: {
        hasExisting: newData.hasExisting === "yes",
        systemType: newData.systemType || undefined,
        systemAge: newData.systemAge || undefined,
        condition: newData.condition || undefined,
        replacementReason: newData.replacementReason || undefined,
        howTheyKnow: Array.isArray(newData.howTheyKnow) && newData.howTheyKnow.length > 0 
          ? newData.howTheyKnow 
          : undefined,
      },
    };
    sessionStorage.setItem("homeownerEstimateInput", JSON.stringify(allData));
  };

  const handleNext = () => {
    router.push("/homeowner/h4");
  };

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={3} totalSteps={5} stepLabels={STEPS} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Step 3: Current System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your current system helps determine what can be reused, what must be upgraded, and where installation costs typically change.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-6">
          {/* Normalization Reassurance */}
          <p className="text-sm text-gray-600 mb-4">
            Most homeowners aren't sure of every system detail. Estimates are refined later if needed.
          </p>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Do you have an existing HVAC system?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "skip", label: "Skip" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.hasExisting === option.value
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="hasExisting"
                    value={option.value}
                    checked={formData.hasExisting === option.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.hasExisting === "yes" && (
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <div>
                <label htmlFor="systemType" className="block text-sm font-semibold text-gray-900 mb-2">
                  Current System Type
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  System type affects installation compatibility and whether existing components can be reused.
                </p>
                <select
                  id="systemType"
                  name="systemType"
                  value={formData.systemType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white"
                >
                  <option value="">Select system type...</option>
                  <option value="central-air">Central Air</option>
                  <option value="heat-pump">Heat Pump</option>
                  <option value="dual-fuel">Dual Fuel</option>
                  <option value="furnace-only">Furnace Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  System Age
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Older systems may need efficiency upgrades or code compliance updates that affect installation scope.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { value: "0-5", label: "0-5 years" },
                    { value: "6-10", label: "6-10 years" },
                    { value: "11-15", label: "11-15 years" },
                    { value: "16-20", label: "16-20 years" },
                    { value: "21-25", label: "21-25 years" },
                    { value: "25+", label: "25+ years" },
                  ].map((option) => {
                    const isSelected = formData.systemAge === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary-600 bg-primary-50 text-primary-700 shadow-md"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="systemAge"
                          value={option.value}
                          checked={isSelected}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="font-medium text-sm">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-semibold text-gray-900 mb-2">
                  Current Condition
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Condition determines whether existing ductwork and components can be reused or must be replaced.
                </p>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white"
                >
                  <option value="">Select condition...</option>
                  <option value="working">Working Well</option>
                  <option value="poor">Poor Condition</option>
                  <option value="not-working">Not Working</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Expectation-Setting Helper Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            These answers help narrow your estimate range. Final pricing is confirmed after a professional evaluation.
          </p>
        </div>

        <p className="text-sm text-gray-500 text-center mt-4 mb-6">
          This is educational information. You're not committing to anything.
        </p>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/homeowner/h2"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline-offset-4 hover:underline"
          >
            Back
          </Link>
          <button
            onClick={handleNext}
            type="button"
            className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-200 shadow-lg text-lg cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
