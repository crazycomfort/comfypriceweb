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

export default function HomeownerH2() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    sqft: "",
    floors: "",
    age: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = sessionStorage.getItem("homeownerEstimateInput");
    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData({
        sqft: parsed.squareFootage || "",
        floors: parsed.floors || "",
        age: parsed.homeAge || "",
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fieldName = e.target.name;
    const value = e.target.value;
    
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    
    // Update local state
    setFormData({
      ...formData,
      [fieldName]: value,
    });
    
    // Update session storage with proper field mapping
    try {
      const existingData = sessionStorage.getItem("homeownerEstimateInput");
      const allData = existingData ? JSON.parse(existingData) : {};
      
      if (fieldName === "sqft") {
        // Parse range to get average or midpoint
        const rangeMatch = value.match(/(\d+)-(\d+)/);
        if (rangeMatch) {
          const min = parseInt(rangeMatch[1]);
          const max = parseInt(rangeMatch[2]);
          allData.squareFootage = Math.round((min + max) / 2);
        } else if (value === "5000+") {
          allData.squareFootage = 5500; // Default for 5000+
        } else {
          allData.squareFootage = parseInt(value) || 0;
        }
      } else if (fieldName === "age") {
        allData.homeAge = value;
      } else if (fieldName === "floors") {
        allData.floors = parseInt(value) || 0;
      }
      
      // Preserve other fields
      allData.zipCode = allData.zipCode || "";
      
      sessionStorage.setItem("homeownerEstimateInput", JSON.stringify(allData));
    } catch (error) {
      console.error("Error saving form data:", error);
    }
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.sqft) {
      newErrors.sqft = "Please select a square footage range";
    }
    if (!formData.floors) {
      newErrors.floors = "Please select number of floors";
    }
    if (!formData.age) {
      newErrors.age = "Please select home age";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    router.push("/homeowner/h3");
  };

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={2} totalSteps={5} stepLabels={STEPS} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Step 2: Home Basics
          </h1>
          <p className="text-lg text-gray-600">
            Help us understand your home's size and characteristics
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
              Square Footage <span className="text-red-500">*</span>
              <HelpTooltip content="Select the total square footage of your home, including all floors. This helps us calculate the appropriate system size and capacity needed for your space." />
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { value: "500-1000", label: "500-1,000 sq ft" },
                { value: "1001-1500", label: "1,001-1,500 sq ft" },
                { value: "1501-2000", label: "1,501-2,000 sq ft" },
                { value: "2001-2500", label: "2,001-2,500 sq ft" },
                { value: "2501-3000", label: "2,501-3,000 sq ft" },
                { value: "3001-4000", label: "3,001-4,000 sq ft" },
                { value: "4001-5000", label: "4,001-5,000 sq ft" },
                { value: "5000+", label: "5,000+ sq ft" },
              ].map((option) => {
                const isSelected = formData.sqft === option.value;
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
                      name="sqft"
                      value={option.value}
                      checked={isSelected}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-medium text-sm text-center">{option.label}</span>
                  </label>
                );
              })}
            </div>
            {errors.sqft && (
              <div className="mt-2" role="alert">
                <ErrorMessage message={errors.sqft} type="error" />
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Total square footage of your home (including all floors)
            </p>
          </div>

          <div>
            <label htmlFor="floors" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              Number of Floors <span className="text-red-500">*</span>
              <HelpTooltip content="The number of floors affects ductwork requirements and system sizing. Multi-story homes may need zoning or additional equipment for optimal comfort." />
            </label>
            <select
              id="floors"
              name="floors"
              value={formData.floors}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white ${
                errors.floors ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            >
              <option value="">Select number of floors...</option>
              <option value="1">1 Floor</option>
              <option value="2">2 Floors</option>
              <option value="3">3 Floors</option>
              <option value="4">4+ Floors</option>
            </select>
            {errors.floors && (
              <div className="mt-2">
                <ErrorMessage message={errors.floors} type="error" />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="age" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              Home Age <span className="text-red-500">*</span>
              <HelpTooltip content="Older homes may need additional ductwork modifications, insulation upgrades, or electrical work. Newer homes typically have better insulation and may require less additional work." />
            </label>
            <select
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white ${
                errors.age ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            >
              <option value="">Select home age...</option>
              <option value="0-10">0-10 years</option>
              <option value="11-20">11-20 years</option>
              <option value="21-30">21-30 years</option>
              <option value="31-50">31-50 years</option>
              <option value="50+">50+ years</option>
            </select>
            {errors.age && (
              <div className="mt-2">
                <ErrorMessage message={errors.age} type="error" />
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Home age affects insulation quality and system requirements
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/homeowner/h1"
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
            disabled={!formData.sqft || !formData.floors || !formData.age}
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
