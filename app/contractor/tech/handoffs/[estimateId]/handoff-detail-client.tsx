"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HandoffData {
  estimateId: string;
  status: "handed_off" | "in_progress" | "completed";
  handedOffAt: string;
  estimate: {
    input: any;
    range: {
      min: number;
      max: number;
    };
    costBreakdown: {
      equipment: number;
      labor: number;
      materials: number;
      total: number;
    };
    selectedTier?: "good" | "better" | "best";
    selectedAddOns?: string[];
    lockedPricing: boolean;
  };
}

export default function TechHandoffDetailClient({ estimateId }: { estimateId: string }) {
  const router = useRouter();
  const [handoff, setHandoff] = useState<HandoffData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetch(`/api/contractor/estimates/${estimateId}/handoff`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (data.handoff) {
          setHandoff(data.handoff);
        } else {
          setError("Handoff not found");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load handoff");
        setLoading(false);
      });
  }, [estimateId]);

  const handleStatusUpdate = async (newStatus: "in_progress" | "completed") => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/contractor/tech/handoffs/${estimateId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.handoff) {
          setHandoff(data.handoff);
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric", 
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4 text-slate-400">Loading estimate...</p>
        </div>
      </div>
    );
  }

  if (!handoff || error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
          {error || "Handoff not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/contractor/tech/handoffs"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Handoffs
        </Link>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Estimate Details
        </h2>
        <p className="text-lg text-slate-300">
          Full estimate context for on-site execution. Pricing is locked.
        </p>
      </div>

      {/* Pricing Locked Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <h3 className="text-yellow-300 font-semibold mb-1">Pricing Locked</h3>
            <p className="text-yellow-200/80 text-sm leading-relaxed">
              All pricing in this estimate is locked and cannot be modified. You have full context 
              for on-site execution, but pricing selections are fixed to ensure consistent execution.
            </p>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Status</h3>
            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${
              handoff.status === "handed_off" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" :
              handoff.status === "in_progress" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
              "bg-green-500/20 text-green-300 border border-green-500/30"
            }`}>
              {handoff.status === "handed_off" ? "Handed Off" :
               handoff.status === "in_progress" ? "In Progress" :
               "Completed"}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400 mb-1">Handed Off</p>
            <p className="text-white">{formatDate(handoff.handedOffAt)}</p>
          </div>
        </div>

        {handoff.status === "handed_off" && (
          <button
            onClick={() => handleStatusUpdate("in_progress")}
            disabled={updatingStatus}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {updatingStatus ? "Updating..." : "Mark In Progress"}
          </button>
        )}

        {handoff.status === "in_progress" && (
          <button
            onClick={() => handleStatusUpdate("completed")}
            disabled={updatingStatus}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {updatingStatus ? "Updating..." : "Mark Completed"}
          </button>
        )}
      </div>

      {/* Estimate Range (Locked) */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Estimate Range (Locked)</h3>
        <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-6 text-center">
          <p className="text-sm text-primary-300 mb-2">Total Flat-Rate Range</p>
          <p className="text-4xl font-bold text-white mb-2">
            {formatCurrency(handoff.estimate.range.min)} - {formatCurrency(handoff.estimate.range.max)}
          </p>
          <p className="text-xs text-primary-300/80">
            This pricing is locked and cannot be modified
          </p>
        </div>
      </div>

      {/* Home Context */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Home Context</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-400 mb-1">Location</p>
            <p className="text-white">ZIP: {handoff.estimate.input.zipCode}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Square Footage</p>
            <p className="text-white">{handoff.estimate.input.squareFootage?.toLocaleString()} sqft</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Number of Floors</p>
            <p className="text-white">{handoff.estimate.input.floors || "Not specified"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Home Age</p>
            <p className="text-white">{handoff.estimate.input.homeAge || "Not specified"}</p>
          </div>
        </div>
      </div>

      {/* System Preferences */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">System Preferences</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-400 mb-1">System Type</p>
            <p className="text-white">{handoff.estimate.input.preferences?.systemType || "Not specified"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Efficiency Level</p>
            <p className="text-white">{handoff.estimate.input.preferences?.efficiencyLevel || "Not specified"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Smart Features</p>
            <p className="text-white">{handoff.estimate.input.preferences?.smartFeatures ? "Yes" : "No"}</p>
          </div>
          {handoff.estimate.selectedTier && (
            <div>
              <p className="text-sm text-slate-400 mb-1">Selected Tier (Locked)</p>
              <p className="text-white font-medium capitalize">{handoff.estimate.selectedTier}</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Add-Ons */}
      {handoff.estimate.selectedAddOns && handoff.estimate.selectedAddOns.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Selected Add-Ons (Locked)</h3>
          <div className="space-y-2">
            {handoff.estimate.selectedAddOns.map((addOnId: string, idx: number) => (
              <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <p className="text-white">Add-On {idx + 1}</p>
                <p className="text-xs text-slate-400">ID: {addOnId}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing System Info */}
      {handoff.estimate.input.existingSystem && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Existing System</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {handoff.estimate.input.existingSystem.systemType && (
              <div>
                <p className="text-sm text-slate-400 mb-1">Current System Type</p>
                <p className="text-white">{handoff.estimate.input.existingSystem.systemType}</p>
              </div>
            )}
            {handoff.estimate.input.existingSystem.systemAge && (
              <div>
                <p className="text-sm text-slate-400 mb-1">System Age</p>
                <p className="text-white">{handoff.estimate.input.existingSystem.systemAge} years</p>
              </div>
            )}
            {handoff.estimate.input.existingSystem.condition && (
              <div>
                <p className="text-sm text-slate-400 mb-1">Condition</p>
                <p className="text-white">{handoff.estimate.input.existingSystem.condition}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Installation Factors */}
      {handoff.estimate.input.installationFactors && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Installation Factors</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {handoff.estimate.input.installationFactors.accessDifficulty && (
              <div>
                <p className="text-sm text-slate-400 mb-1">Access Difficulty</p>
                <p className="text-white capitalize">{handoff.estimate.input.installationFactors.accessDifficulty}</p>
              </div>
            )}
            {handoff.estimate.input.installationFactors.permits && (
              <div>
                <p className="text-sm text-slate-400 mb-1">Permits</p>
                <p className="text-white">{handoff.estimate.input.installationFactors.permits}</p>
              </div>
            )}
            {handoff.estimate.input.installationFactors.timeline && (
              <div>
                <p className="text-sm text-slate-400 mb-1">Timeline</p>
                <p className="text-white">{handoff.estimate.input.installationFactors.timeline}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assumptions */}
      {handoff.estimate.assumptions && handoff.estimate.assumptions.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8">
          <h3 className="text-xl font-semibold text-white mb-4">Estimate Assumptions</h3>
          <ul className="space-y-2">
            {handoff.estimate.assumptions.map((assumption: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <svg className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>{assumption}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}



