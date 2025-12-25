"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isFeatureEnabled } from "@/lib/feature-flags";
import ProgressIndicator from "@/app/components/ProgressIndicator";
import ContractorHeader from "@/app/components/ContractorHeader";

const STEPS = [
  "Location & Size",
  "System Type",
  "Pricing Breakdown",
  "Client Estimate",
];

export default function ContractorC4Client() {
  const router = useRouter();
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [creatingShare, setCreatingShare] = useState(false);
  const estimateSharingEnabled = isFeatureEnabled("estimateSharing");

  useEffect(() => {
    const estimateId = sessionStorage.getItem("contractorEstimateId");
    if (estimateId) {
      fetch(`/api/homeowner/estimate/${estimateId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.estimate) {
            setEstimate(data.estimate);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
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
          <p className="text-xl font-semibold text-white mb-2">Loading Estimate...</p>
          <p className="text-slate-400">Preparing client estimate</p>
        </div>
      </main>
    );
  }

  if (!estimate) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="bg-yellow-500/10 backdrop-blur-md border border-yellow-500/50 p-8 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-10 h-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-2xl font-bold text-yellow-400">No Estimate Found</h2>
            </div>
            <p className="text-yellow-200 mb-6">
              No estimate found. Please generate an estimate first.
            </p>
            <Link 
              href="/contractor/c1" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer"
            >
              Start Over
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <ContractorHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ProgressIndicator currentStep={4} totalSteps={4} stepLabels={STEPS} />

        <div className="mt-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-6 shadow-lg shadow-emerald-500/20">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Client Estimate Ready
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Generate a shareable estimate for your client
            </p>
          </div>

          {/* Estimate Summary Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 md:p-10 mb-8">
            {/* Price Range - Hero */}
            <div className="text-center mb-10 pb-10 border-b border-white/10">
              <p className="text-sm text-slate-400 uppercase tracking-wider mb-4 font-semibold">
                Estimated Total Range
              </p>
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                {formatCurrency(estimate.range.min)} - {formatCurrency(estimate.range.max)}
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>All-inclusive</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>No hidden fees</span>
                </div>
              </div>
            </div>

            {/* Summary Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-primary-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">System Type</p>
                  <p className="font-bold text-white capitalize">
                    {estimate.input.preferences.systemType.replace("-", " ")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-emerald-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Efficiency</p>
                  <p className="font-bold text-white capitalize">
                    {estimate.input.preferences.efficiencyLevel}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Square Footage</p>
                  <p className="font-bold text-white">
                    {estimate.input.squareFootage.toLocaleString()} sqft
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-orange-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Location</p>
                  <p className="font-bold text-white">
                    {estimate.input.zipCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Note:</strong> This is a ballpark estimate. Final pricing may vary based on 
                site inspection, specific requirements, equipment brands selected, and local market conditions.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link
                href="/contractor/c3"
                className="inline-flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Link>
              {estimateSharingEnabled ? (
                shareToken ? (
                  <Link
                    href={`/estimate/${shareToken}`}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-green-800 transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 cursor-pointer text-lg"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Share Link
                  </Link>
                ) : (
                  <button
                    onClick={async () => {
                      setCreatingShare(true);
                      try {
                        const res = await fetch("/api/share/create", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            estimateId: estimate.estimateId,
                            expiresInHours: 168,
                            singleUse: false,
                          }),
                        });
                        const data = await res.json();
                        if (data.token) {
                          setShareToken(data.token);
                          const shareUrl = `${window.location.origin}/estimate/${data.token}`;
                          navigator.clipboard.writeText(shareUrl);
                          alert("Share link created and copied to clipboard!");
                        } else {
                          alert(data.error || "Failed to create share link");
                        }
                      } catch (error) {
                        alert("Failed to create share link");
                      } finally {
                        setCreatingShare(false);
                      }
                    }}
                    disabled={creatingShare}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 disabled:transform-none cursor-pointer text-lg"
                  >
                    {creatingShare ? (
                      <>
                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Create Share Link
                      </>
                    )}
                  </button>
                )
              ) : (
                <button
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-600 text-white font-semibold rounded-xl cursor-not-allowed opacity-50"
                  disabled
                >
                  Generate PDF (Coming Soon)
                </button>
              )}
            </div>
            
            <div className="flex justify-center pt-6 border-t border-white/10">
              <Link
                href="/contractor/c1"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 cursor-pointer text-lg"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Start New Estimate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
