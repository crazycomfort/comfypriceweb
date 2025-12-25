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

export default function ContractorC3Client() {
  const router = useRouter();
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const formData = sessionStorage.getItem("contractorEstimateInput");
    if (!formData) {
      setError("No estimate data found. Please start over.");
      setLoading(false);
      return;
    }

    let inputData;
    try {
      inputData = JSON.parse(formData);
    } catch {
      setError("Invalid form data. Please start over.");
      setLoading(false);
      return;
    }

    fetch("/api/contractor/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputData),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || "Failed to generate estimate");
          });
        }
        return res.json();
      })
      .then((data) => {
        if (data.estimate) {
          setEstimate(data.estimate);
          sessionStorage.setItem("contractorEstimateId", data.estimate.estimateId);
        } else {
          setError("Failed to generate estimate");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to generate estimate");
        setLoading(false);
      });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-500/30 border-t-primary-500 mb-6"></div>
          <p className="text-xl font-semibold text-white mb-2">Generating Pricing Breakdown...</p>
          <p className="text-slate-400">Analyzing costs and labor estimates</p>
        </div>
      </main>
    );
  }

  if (error || !estimate) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="bg-red-500/10 backdrop-blur-md border border-red-500/50 p-8 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-red-400">Unable to Generate Estimate</h2>
            </div>
            <p className="text-red-200 mb-6">{error || "Failed to generate estimate"}</p>
            <div className="flex gap-4">
              <Link 
                href="/contractor/c1" 
                className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer"
              >
                Start Over
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const equipmentMin = estimate.costBreakdown.equipment * 0.6;
  const equipmentMax = estimate.costBreakdown.equipment * 0.8;
  const laborHoursMin = Math.ceil(estimate.costBreakdown.labor / 100);
  const laborHoursMax = Math.ceil(estimate.costBreakdown.labor / 80);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <ContractorHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ProgressIndicator currentStep={3} totalSteps={4} stepLabels={STEPS} />

        <div className="mt-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 shadow-lg shadow-green-500/20">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Pricing Breakdown
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Detailed cost analysis by category
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 backdrop-blur-md border border-primary-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary-500/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-slate-300 text-sm mb-2">Equipment</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(estimate.costBreakdown.equipment)}</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-md border border-green-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-slate-300 text-sm mb-2">Labor</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(estimate.costBreakdown.labor)}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="text-slate-300 text-sm mb-2">Materials</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(estimate.costBreakdown.materials)}</div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 space-y-8">
            {/* Equipment Costs */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-500/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Equipment Cost Ranges</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b border-white/10">
                  <span className="text-slate-300 font-medium">AC Unit / System</span>
                  <span className="text-white font-bold text-lg">
                    {formatCurrency(equipmentMin)} - {formatCurrency(equipmentMax)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-white/10">
                  <span className="text-slate-300 font-medium">Furnace (if applicable)</span>
                  <span className="text-white font-bold text-lg">
                    {formatCurrency(estimate.costBreakdown.equipment * 0.2)} - {formatCurrency(estimate.costBreakdown.equipment * 0.3)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-slate-300 font-medium">Thermostat & Controls</span>
                  <span className="text-white font-bold text-lg">
                    {formatCurrency(estimate.costBreakdown.equipment * 0.05)} - {formatCurrency(estimate.costBreakdown.equipment * 0.1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Labor Estimates */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Labor Hour Estimates</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b border-white/10">
                  <span className="text-slate-300 font-medium">Installation</span>
                  <span className="text-white font-bold text-lg">
                    {laborHoursMin} - {laborHoursMax} hours
                  </span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-slate-300 font-medium">Ductwork (if needed)</span>
                  <span className="text-white font-bold text-lg">
                    {Math.ceil(estimate.costBreakdown.labor * 0.3 / 100)} - {Math.ceil(estimate.costBreakdown.labor * 0.3 / 80)} hours
                  </span>
                </div>
              </div>
            </div>

            {/* Material Costs */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Material Cost Breakdowns</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b border-white/10">
                  <span className="text-slate-300 font-medium">Ductwork Materials</span>
                  <span className="text-white font-bold text-lg">
                    {formatCurrency(estimate.costBreakdown.materials * 0.5)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-white/10">
                  <span className="text-slate-300 font-medium">Refrigerant</span>
                  <span className="text-white font-bold text-lg">
                    {formatCurrency(estimate.costBreakdown.materials * 0.2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-slate-300 font-medium">Other Materials</span>
                  <span className="text-white font-bold text-lg">
                    {formatCurrency(estimate.costBreakdown.materials * 0.3)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Notes */}
          <div className="mt-8 bg-primary-500/10 backdrop-blur-md border border-primary-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-bold text-primary-300 mb-2">Regional Pricing Notes</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Pricing based on ZIP code region averages. Final costs may vary based on local market conditions, 
                  specific equipment brands, and installation complexity.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-end">
            <Link
              href="/contractor/c4"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 cursor-pointer text-lg"
            >
              Continue to Client Estimate
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
