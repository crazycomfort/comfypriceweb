"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ContractorHeader from "@/app/components/ContractorHeader";
import ErrorMessage from "@/app/components/ErrorMessage";
import PageLoader from "@/app/components/PageLoader";

interface Estimate {
  estimateId: string;
  tierRanges: {
    good: { min: number; max: number };
    better: { min: number; max: number };
    best: { min: number; max: number };
  };
  customPricing?: {
    good?: { min: number; max: number };
    better?: { min: number; max: number };
    best?: { min: number; max: number };
  };
  pricingVarianceNotes?: string;
  assumptions: string[];
  createdAt?: string;
}

export default function EstimateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const estimateId = params?.estimateId as string;
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCustomPricing, setShowCustomPricing] = useState(false);
  const [customPricing, setCustomPricing] = useState<{
    good?: { min: number; max: number };
    better?: { min: number; max: number };
    best?: { min: number; max: number };
  }>({});
  const [varianceNotes, setVarianceNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [qualityIndicators, setQualityIndicators] = useState<string[]>([]);

  useEffect(() => {
    if (!estimateId) {
      setError("Estimate ID is required");
      setLoading(false);
      return;
    }

    fetch(`/api/contractor/estimates/${estimateId}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Estimate not found");
          }
          if (res.status === 401 || res.status === 403) {
            router.push("/contractor/access-denied");
            return null;
          }
          throw new Error("Failed to load estimate");
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success && data.estimate) {
          setEstimate(data.estimate);
          // Load custom pricing if it exists
          if (data.estimate.customPricing) {
            setCustomPricing(data.estimate.customPricing);
            setShowCustomPricing(true);
          }
          if (data.estimate.pricingVarianceNotes) {
            setVarianceNotes(data.estimate.pricingVarianceNotes);
          }
        } else {
          setError("Estimate not found");
        }
        setLoading(false);
      })
      .then(() => {
        // Fetch quality indicators
        if (estimateId) {
          fetch(`/api/contractor/estimates/${estimateId}/lead-signals`)
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.indicators) {
                setQualityIndicators(data.indicators);
              }
            })
            .catch(() => {
              // Silently fail - indicators are optional
            });
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load estimate");
        setLoading(false);
      });
  }, [estimateId, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "Recently";
    }
  };

  const handleSaveCustomPricing = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const response = await fetch(`/api/contractor/estimates/${estimateId}/custom-pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customPricing: customPricing,
          pricingVarianceNotes: varianceNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save custom pricing");
        setSaving(false);
        return;
      }

      if (data.success) {
        setEstimate(prev => prev ? {
          ...prev,
          customPricing: data.estimate.customPricing,
          pricingVarianceNotes: data.estimate.pricingVarianceNotes,
        } : null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      setError("Failed to save custom pricing");
    } finally {
      setSaving(false);
    }
  };

  const handleClearCustomPricing = () => {
    setCustomPricing({});
    setVarianceNotes("");
    setShowCustomPricing(false);
    handleSaveCustomPricing();
  };

  const getDisplayPricing = (tier: "good" | "better" | "best") => {
    if (showCustomPricing && customPricing[tier]) {
      return customPricing[tier]!;
    }
    return estimate!.tierRanges[tier];
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <ContractorHeader />
        <PageLoader message="Loading estimate..." />
      </main>
    );
  }

  if (error || !estimate) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <ContractorHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ErrorMessage
            title="Unable to Load Estimate"
            message={error || "The estimate you're looking for doesn't exist or you don't have access to it."}
            type="error"
          />
          <div className="mt-6">
            <Link
              href="/contractor/estimates"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer"
            >
              ← Back to Estimates
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ContractorHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/contractor/estimates"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Estimates
          </Link>
          <div className="flex items-start justify-between mb-2 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Homeowner Estimate Review
              </h1>
              <p className="text-slate-300">Created {formatDate(estimate.createdAt)}</p>
            </div>
            {/* Quality Indicators */}
            {qualityIndicators.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {qualityIndicators.map((indicator, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded text-xs font-medium bg-primary-500/20 text-primary-200 border border-primary-500/30"
                  >
                    {indicator}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pricing Ranges - Reflect Common Installation Scenarios */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Homeowner Estimate Ranges</h2>
            <button
              onClick={() => setShowCustomPricing(!showCustomPricing)}
              className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              {showCustomPricing ? "Hide Custom Pricing" : "Set Custom Pricing"}
            </button>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-200">
              <strong>Pre-qualified homeowner:</strong> This homeowner has reviewed pricing ranges and understands that an on-site evaluation may refine pricing based on specific conditions. This is standard professional practice.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <p className="text-slate-400 text-sm mb-2 uppercase tracking-wide">Good</p>
              <p className="text-2xl font-bold text-white mb-1">
                {formatCurrency(estimate.tierRanges.good.min)} - {formatCurrency(estimate.tierRanges.good.max)}
              </p>
              <p className="text-xs text-slate-400">Reliable, efficient system</p>
            </div>
            <div className="bg-primary-500/20 rounded-xl p-6 border border-primary-500/30">
              <p className="text-primary-200 text-sm mb-2 uppercase tracking-wide">Better</p>
              <p className="text-2xl font-bold text-primary-300 mb-1">
                {formatCurrency(estimate.tierRanges.better.min)} - {formatCurrency(estimate.tierRanges.better.max)}
              </p>
              <p className="text-xs text-primary-200/80">Balanced performance and value</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <p className="text-slate-400 text-sm mb-2 uppercase tracking-wide">Best</p>
              <p className="text-2xl font-bold text-white mb-1">
                {formatCurrency(estimate.tierRanges.best.min)} - {formatCurrency(estimate.tierRanges.best.max)}
              </p>
              <p className="text-xs text-slate-400">Maximum efficiency and reliability</p>
            </div>
          </div>
        </div>

        {/* Custom Final Pricing Section */}
        {showCustomPricing && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Your Final Pricing</h2>
            <p className="text-sm text-slate-300 mb-6">
              Set your final pricing based on your professional evaluation. An on-site evaluation may refine pricing based on specific conditions—this is standard professional practice. You have full pricing authority.
            </p>

            {saveSuccess && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-6">
                Custom pricing saved successfully.
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Good Tier */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <p className="text-slate-400 text-sm mb-3 uppercase tracking-wide font-semibold">Good</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Min Price</label>
                    <input
                      type="number"
                      value={customPricing.good?.min || estimate.tierRanges.good.min}
                      onChange={(e) => setCustomPricing({
                        ...customPricing,
                        good: {
                          min: parseInt(e.target.value) || 0,
                          max: customPricing.good?.max || estimate.tierRanges.good.max,
                        },
                      })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={estimate.tierRanges.good.min.toString()}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Max Price</label>
                    <input
                      type="number"
                      value={customPricing.good?.max || estimate.tierRanges.good.max}
                      onChange={(e) => setCustomPricing({
                        ...customPricing,
                        good: {
                          min: customPricing.good?.min || estimate.tierRanges.good.min,
                          max: parseInt(e.target.value) || 0,
                        },
                      })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={estimate.tierRanges.good.max.toString()}
                    />
                  </div>
                </div>
              </div>

              {/* Better Tier */}
              <div className="bg-primary-500/20 rounded-xl p-6 border border-primary-500/30">
                <p className="text-primary-200 text-sm mb-3 uppercase tracking-wide font-semibold">Better</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-primary-200/80 mb-1">Min Price</label>
                    <input
                      type="number"
                      value={customPricing.better?.min || estimate.tierRanges.better.min}
                      onChange={(e) => setCustomPricing({
                        ...customPricing,
                        better: {
                          min: parseInt(e.target.value) || 0,
                          max: customPricing.better?.max || estimate.tierRanges.better.max,
                        },
                      })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={estimate.tierRanges.better.min.toString()}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-primary-200/80 mb-1">Max Price</label>
                    <input
                      type="number"
                      value={customPricing.better?.max || estimate.tierRanges.better.max}
                      onChange={(e) => setCustomPricing({
                        ...customPricing,
                        better: {
                          min: customPricing.better?.min || estimate.tierRanges.better.min,
                          max: parseInt(e.target.value) || 0,
                        },
                      })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={estimate.tierRanges.better.max.toString()}
                    />
                  </div>
                </div>
              </div>

              {/* Best Tier */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <p className="text-slate-400 text-sm mb-3 uppercase tracking-wide font-semibold">Best</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Min Price</label>
                    <input
                      type="number"
                      value={customPricing.best?.min || estimate.tierRanges.best.min}
                      onChange={(e) => setCustomPricing({
                        ...customPricing,
                        best: {
                          min: parseInt(e.target.value) || 0,
                          max: customPricing.best?.max || estimate.tierRanges.best.max,
                        },
                      })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={estimate.tierRanges.best.min.toString()}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Max Price</label>
                    <input
                      type="number"
                      value={customPricing.best?.max || estimate.tierRanges.best.max}
                      onChange={(e) => setCustomPricing({
                        ...customPricing,
                        best: {
                          min: customPricing.best?.min || estimate.tierRanges.best.min,
                          max: parseInt(e.target.value) || 0,
                        },
                      })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={estimate.tierRanges.best.max.toString()}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Variance Notes */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Notes Explaining Your Professional Pricing (Optional)
              </label>
              <p className="text-xs text-slate-400 mb-2">
                Explain to homeowners why your pricing reflects your professional evaluation. 
                This builds trust and demonstrates your pricing authority.
              </p>
              <textarea
                value={varianceNotes}
                onChange={(e) => setVarianceNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Example: 'Pricing adjusted based on on-site evaluation. Your home requires additional ductwork modifications and electrical upgrades not reflected in the automated estimate.'"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleSaveCustomPricing}
                disabled={saving}
                className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : "Save Custom Pricing"}
              </button>
              <button
                onClick={handleClearCustomPricing}
                disabled={saving}
                className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/15 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear & Use Reference Ranges
              </button>
            </div>
          </div>
        )}

        {/* Display Final Pricing (if custom pricing is set) */}
        {showCustomPricing && Object.keys(customPricing).length > 0 && (
          <div className="bg-green-500/10 backdrop-blur-md rounded-2xl border border-green-500/30 shadow-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Your Professional Pricing (Shown to Homeowner)</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <p className="text-slate-400 text-sm mb-2 uppercase tracking-wide">Good</p>
                <p className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(getDisplayPricing("good").min)} - {formatCurrency(getDisplayPricing("good").max)}
                </p>
                <p className="text-xs text-slate-400">Reliable, efficient system</p>
              </div>
              <div className="bg-primary-500/20 rounded-xl p-6 border border-primary-500/30">
                <p className="text-primary-200 text-sm mb-2 uppercase tracking-wide">Better</p>
                <p className="text-2xl font-bold text-primary-300 mb-1">
                  {formatCurrency(getDisplayPricing("better").min)} - {formatCurrency(getDisplayPricing("better").max)}
                </p>
                <p className="text-xs text-primary-200/80">Balanced performance and value</p>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <p className="text-slate-400 text-sm mb-2 uppercase tracking-wide">Best</p>
                <p className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(getDisplayPricing("best").min)} - {formatCurrency(getDisplayPricing("best").max)}
                </p>
                <p className="text-xs text-slate-400">Maximum efficiency and reliability</p>
              </div>
            </div>
            {varianceNotes && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm font-semibold text-white mb-2">Pricing Notes:</p>
                <p className="text-sm text-slate-300 leading-relaxed">{varianceNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Assumptions */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Estimate Assumptions</h2>
          <p className="text-slate-300 mb-6">
            This estimate is based on the following assumptions. Final pricing may vary based on specific installation requirements.
          </p>
          <ul className="space-y-3">
            {estimate.assumptions.map((assumption, index) => (
              <li key={index} className="flex items-start text-slate-300">
                <svg
                  className="w-5 h-5 text-primary-400 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span>{assumption}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={`/contractor/estimates/${estimateId}/handoff`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Hand Off to Tech
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/15 transition-colors border border-white/20 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / PDF
          </button>
          <Link
            href="/contractor/c1"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/15 transition-colors border border-white/20 cursor-pointer"
          >
            Create Pricing Range
          </Link>
        </div>
      </div>
    </main>
  );
}

