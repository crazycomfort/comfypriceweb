"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressIndicator from "@/app/components/ProgressIndicator";
import HelpTooltip from "@/app/components/HelpTooltip";

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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={3} totalSteps={5} stepLabels={STEPS} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Step 3: Current System
          </h1>
          <p className="text-lg text-gray-600">
            Tell us about your existing HVAC system (optional)
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              Do you have an existing HVAC system?
              <HelpTooltip content="This information helps us understand if you're replacing an existing system or installing new. Replacement installations may have different costs depending on the condition of existing ductwork and equipment." />
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
            <div className="space-y-6 pt-6 border-t border-gray-200 animate-in fade-in slide-in-from-top-2">
              <div>
                <label htmlFor="systemType" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  System Type
                  <HelpTooltip content="The type of system you currently have. This helps determine compatibility and whether any modifications are needed for a new system." />
                </label>
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
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                  System Age
                  <HelpTooltip content="Older systems (15+ years) are typically less efficient and may need more extensive replacement work. Newer systems may only need minor modifications." />
                </label>
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
                <label htmlFor="condition" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  Condition
                  <HelpTooltip content="The condition of your current system affects installation complexity. Poor or non-working systems may require additional cleanup or ductwork repairs." />
                </label>
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

              {/* Replacement Reason Questions */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                    Why are you replacing your system?
                    <HelpTooltip content="Understanding your motivation helps us provide the best recommendations. Are you being proactive, or is there an urgent need?" />
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { value: "proactive", label: "Proactive - System is old but still working" },
                      { value: "broken", label: "System is broken/not working" },
                      { value: "inefficient", label: "System is inefficient/high energy bills" },
                      { value: "upgrade", label: "Want to upgrade for better features" },
                      { value: "home-improvement", label: "Part of home improvement project" },
                      { value: "other", label: "Other reason" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.replacementReason === option.value
                            ? "border-primary-600 bg-primary-50 text-primary-700 shadow-md"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="replacementReason"
                          value={option.value}
                          checked={formData.replacementReason === option.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="font-medium text-sm leading-relaxed">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                    How do you know it's time to replace? (Select all that apply)
                    <HelpTooltip content="This helps us understand what signs or factors led you to consider replacement. You can select multiple options." />
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { value: "age", label: "System is 15+ years old" },
                      { value: "repairs", label: "Frequent repairs needed" },
                      { value: "bills", label: "High energy bills" },
                      { value: "comfort", label: "Home not comfortable" },
                      { value: "noise", label: "System is too noisy" },
                      { value: "contractor", label: "Contractor recommended replacement" },
                      { value: "research", label: "Research shows it's time" },
                    ].map((option) => {
                      const isSelected = Array.isArray(formData.howTheyKnow) 
                        ? formData.howTheyKnow.includes(option.value)
                        : formData.howTheyKnow === option.value;
                      return (
                        <label
                          key={option.value}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary-600 bg-primary-50 text-primary-700 shadow-md"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            value={option.value}
                            checked={isSelected}
                            onChange={(e) => {
                              const current = Array.isArray(formData.howTheyKnow) 
                                ? formData.howTheyKnow 
                                : formData.howTheyKnow ? [formData.howTheyKnow] : [];
                              const newValue = e.target.checked
                                ? [...current, option.value]
                                : current.filter(v => v !== option.value);
                              handleChange({
                                target: { name: "howTheyKnow", value: newValue }
                              } as any);
                            }}
                            className="sr-only"
                          />
                          <span className="font-medium text-sm leading-relaxed">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/homeowner/h2"
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
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
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
