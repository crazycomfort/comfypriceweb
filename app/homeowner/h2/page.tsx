"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressIndicator from "@/app/components/ProgressIndicator";
import ErrorMessage from "@/app/components/ErrorMessage";
import { SecondarySection, SecondaryHeader, PrimaryCTA, SecondaryCTA } from "@/app/components/SectionHierarchy";

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
      try {
        const parsed = JSON.parse(saved);
        
        // Map squareFootage number back to range string
        let sqftValue = "";
        if (parsed.squareFootage) {
          const sqft = parsed.squareFootage;
          if (sqft <= 1000) sqftValue = "500-1000";
          else if (sqft <= 1500) sqftValue = "1001-1500";
          else if (sqft <= 2000) sqftValue = "1501-2000";
          else if (sqft <= 2500) sqftValue = "2001-2500";
          else if (sqft <= 3000) sqftValue = "2501-3000";
          else if (sqft <= 4000) sqftValue = "3001-4000";
          else if (sqft <= 5000) sqftValue = "4001-5000";
          else sqftValue = "5000+";
        }
        
        setFormData({
          sqft: sqftValue,
          floors: parsed.floors ? String(parsed.floors) : "",
          age: parsed.homeAge || "",
        });
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
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
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SecondarySection>
        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator currentStep={2} totalSteps={5} stepLabels={STEPS} />
        </div>

        {/* Header */}
        <SecondaryHeader
          title="Step 2: Home Characteristics"
          subtitle="These details anchor your estimate to realistic system size and installation complexity."
          align="center"
          className="mb-12"
        />

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Square Footage <span className="text-red-500">*</span>
            </label>
            
            {/* Insight Block */}
            <p className="text-sm text-gray-600 mb-4">
              Homes in this size range typically require systems designed for consistent airflow and proper load balancing.
            </p>

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
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
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

            {/* Conditional Price Signal */}
            {formData.sqft && (
              <div className="mt-3 text-sm text-gray-600">
                {(() => {
                  const rangeMatch = formData.sqft.match(/(\d+)-(\d+)/);
                  if (!rangeMatch) {
                    if (formData.sqft === "5000+") {
                      return "Larger homes often require higher-capacity or zoned systems, increasing cost.";
                    }
                    return "";
                  }
                  
                  const min = parseInt(rangeMatch[1]);
                  const max = parseInt(rangeMatch[2]);
                  
                  if (min >= 2000 && min < 2500) {
                    return "Installations in this range are rarely under $7,000 when done correctly.";
                  } else if (min >= 2500 && min < 3000) {
                    return "Most professionally installed systems in this range fall into mid five figures.";
                  } else if (min >= 3000) {
                    return "Larger homes often require higher-capacity or zoned systems, increasing cost.";
                  }
                  return "";
                })()}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="floors" className="block text-sm font-semibold text-gray-900 mb-2">
              Number of Floors <span className="text-red-500">*</span>
            </label>
            
            {/* Insight Block */}
            <p className="text-sm text-gray-600 mb-3">
              Multi-story homes often require additional airflow control to maintain even comfort.
            </p>

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
            <label htmlFor="age" className="block text-sm font-semibold text-gray-900 mb-2">
              Home Age <span className="text-red-500">*</span>
            </label>
            
            {/* Insight Block */}
            <p className="text-sm text-gray-600 mb-3">
              Older homes more frequently require infrastructure updates during HVAC replacement.
            </p>

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
              <option value="0-10">Newer (0-10 years)</option>
              <option value="11-20">Mid-age (11-20 years)</option>
              <option value="21-30">Older (21-30 years)</option>
              <option value="31-50">Older (31-50 years)</option>
              <option value="50+">Older (50+ years)</option>
            </select>
            {errors.age && (
              <div className="mt-2">
                <ErrorMessage message={errors.age} type="error" />
              </div>
            )}

            {/* Conditional Callout */}
            {formData.age && (formData.age === "21-30" || formData.age === "31-50" || formData.age === "50+") && (
              <div className="mt-3 text-sm text-gray-600">
                Homes over 20 years old commonly need at least one supporting upgrade during installation.
              </div>
            )}
          </div>
        </div>

        {/* Validation Moment */}
        {formData.sqft && formData.floors && formData.age && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              This puts you ahead of the process. Most homeowners don't get this level of clarity.
            </p>
          </div>
        )}

        {/* Navigation - ONE PRIMARY CTA */}
        <div className="mt-12 flex justify-between items-center">
          <Link
            href="/homeowner/h1"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline-offset-4 hover:underline"
          >
            Back
          </Link>
          <button
            onClick={handleNext}
            disabled={!formData.sqft || !formData.floors || !formData.age}
            type="button"
            className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-lg cursor-pointer"
          >
            Continue
          </button>
        </div>
      </SecondarySection>
    </main>
  );
}
