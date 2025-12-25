"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressIndicator from "@/app/components/ProgressIndicator";
import ContractorHeader from "@/app/components/ContractorHeader";

const STEPS = [
  "Location & Size",
  "System Type",
  "Pricing Breakdown",
  "Client Estimate",
];

export default function ContractorC1Client() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState("");
  const [sqft, setSqft] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    setError("");
    
    // Validate inputs
    if (!zipCode || !/^\d{5}(-\d{4})?$/.test(zipCode.trim())) {
      setError("Please enter a valid ZIP code");
      return;
    }
    
    if (!sqft || parseInt(sqft) <= 0) {
      setError("Please enter a valid square footage");
      return;
    }

    // Store in session for next step
    sessionStorage.setItem("contractorEstimateInput", JSON.stringify({
      zipCode: zipCode.trim(),
      squareFootage: parseInt(sqft),
    }));
    
    router.push("/contractor/c2");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <ContractorHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={1} totalSteps={4} stepLabels={STEPS} />

        {/* Main Content */}
        <div className="mt-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-lg shadow-primary-500/20">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Property Details
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Enter location and size to get instant pricing estimates
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 md:p-10">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2 mb-6 backdrop-blur-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* ZIP Code Input */}
              <div className="md:col-span-1">
                <label htmlFor="zipcode" className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  ZIP Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="zipcode"
                  name="zipcode"
                  value={zipCode}
                  onChange={(e) => {
                    setZipCode(e.target.value);
                    setError("");
                  }}
                  placeholder="90210"
                  required
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-white placeholder:text-slate-400 backdrop-blur-sm text-lg font-medium"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNext();
                  }}
                />
                <p className="mt-2 text-sm text-slate-400">
                  Regional pricing & labor rates
                </p>
              </div>

              {/* Square Footage Input */}
              <div className="md:col-span-1">
                <label htmlFor="sqft" className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Square Footage <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  id="sqft"
                  name="sqft"
                  value={sqft}
                  onChange={(e) => {
                    setSqft(e.target.value);
                    setError("");
                  }}
                  placeholder="2000"
                  required
                  min="1"
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-white placeholder:text-slate-400 backdrop-blur-sm text-lg font-medium"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNext();
                  }}
                />
                <p className="mt-2 text-sm text-slate-400">
                  Total property size
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!zipCode.trim() || !sqft.trim()}
                type="button"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 disabled:transform-none cursor-pointer text-lg"
              >
                Continue
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
