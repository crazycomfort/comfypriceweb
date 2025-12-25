"use client";

import { useState, useEffect } from "react";
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

export default function ContractorC2Client() {
  const router = useRouter();
  const [systemType, setSystemType] = useState("");
  const [efficiency, setEfficiency] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Load existing data
    const saved = sessionStorage.getItem("contractorEstimateInput");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSystemType(parsed.preferences?.systemType || "");
      setEfficiency(parsed.preferences?.efficiencyLevel || "");
    }
  }, []);

  const handleNext = () => {
    setError("");
    
    if (!systemType || !efficiency) {
      setError("Please select both system type and efficiency level");
      return;
    }

    // Update session storage
    const existing = sessionStorage.getItem("contractorEstimateInput");
    const data = existing ? JSON.parse(existing) : {};
    data.preferences = {
      systemType,
      efficiencyLevel: efficiency,
      smartFeatures: false,
    };
    sessionStorage.setItem("contractorEstimateInput", JSON.stringify(data));
    
    router.push("/contractor/c3");
  };

  const systemOptions = [
    { value: "central-air", label: "Central Air", icon: "❄️", desc: "Cooling only" },
    { value: "heat-pump", label: "Heat Pump", icon: "🔄", desc: "Heating & Cooling" },
    { value: "dual-fuel", label: "Dual Fuel", icon: "⚡", desc: "Hybrid system" },
    { value: "furnace-only", label: "Furnace Only", icon: "🔥", desc: "Heating only" },
  ];

  const efficiencyOptions = [
    { value: "basic", label: "Basic", seer: "SEER 13-14", desc: "Standard efficiency" },
    { value: "standard", label: "Standard", seer: "SEER 15-16", desc: "Good efficiency" },
    { value: "premium", label: "Premium", seer: "SEER 17+", desc: "High efficiency" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <ContractorHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ProgressIndicator currentStep={2} totalSteps={4} stepLabels={STEPS} />

        <div className="mt-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-lg shadow-primary-500/20">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              System Configuration
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Select system type and efficiency level
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 md:p-10 space-y-8">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2 backdrop-blur-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* System Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                System Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {systemOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSystemType(option.value);
                      setError("");
                    }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      systemType === option.value
                        ? "border-primary-500 bg-primary-500/20 shadow-lg shadow-primary-500/20"
                        : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-3xl mb-2">{option.icon}</div>
                    <div className="text-white font-semibold text-sm mb-1">{option.label}</div>
                    <div className="text-slate-400 text-xs">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Efficiency Level Selection */}
            <div>
              <label className="block text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Efficiency Level <span className="text-red-400">*</span>
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {efficiencyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setEfficiency(option.value);
                      setError("");
                    }}
                    className={`p-5 rounded-xl border-2 transition-all text-left cursor-pointer ${
                      efficiency === option.value
                        ? "border-primary-500 bg-primary-500/20 shadow-lg shadow-primary-500/20"
                        : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-white font-bold text-lg mb-1">{option.label}</div>
                    <div className="text-primary-400 font-semibold text-sm mb-2">{option.seer}</div>
                    <div className="text-slate-400 text-xs">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!systemType || !efficiency}
                type="button"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 disabled:transform-none cursor-pointer text-lg"
              >
                Generate Pricing
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
