"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SecondarySection, SecondaryHeader, Card } from "@/app/components/SectionHierarchy";

interface HandedOffEstimate {
  estimateId: string;
  handedOffAt: string;
  status: "handed_off" | "in_progress" | "completed";
  estimate: {
    input: any;
    range: {
      min: number;
      max: number;
    };
    selectedTier?: "good" | "better" | "best";
    selectedAddOns?: string[];
    lockedPricing: boolean;
  };
}

export default function TechHandoffsClient() {
  const router = useRouter();
  const [handoffs, setHandoffs] = useState<HandedOffEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "handed_off" | "in_progress" | "completed">("all");

  useEffect(() => {
    fetch("/api/contractor/tech/handoffs")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (data.handoffs) {
          setHandoffs(data.handoffs);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load handed-off estimates");
        setLoading(false);
      });
  }, []);

  const handleStatusUpdate = async (estimateId: string, newStatus: "in_progress" | "completed") => {
    try {
      const response = await fetch(`/api/contractor/tech/handoffs/${estimateId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setHandoffs(prev => prev.map(handoff =>
          handoff.estimateId === estimateId
            ? { ...handoff, status: newStatus }
            : handoff
        ));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "handed_off":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "handed_off":
        return "Handed Off";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const filteredHandoffs = selectedStatus === "all"
    ? handoffs
    : handoffs.filter(handoff => handoff.status === selectedStatus);

  const statusCounts = {
    all: handoffs.length,
    handed_off: handoffs.filter(h => h.status === "handed_off").length,
    in_progress: handoffs.filter(h => h.status === "in_progress").length,
    completed: handoffs.filter(h => h.status === "completed").length,
  };

  return (
    <SecondarySection background="subtle" className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mb-8">
        <Link
          href="/contractor/dashboard"
          className="cta-tertiary inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
        <SecondaryHeader
          title="Handed-Off Estimates"
          subtitle="View estimates handed off to you. Pricing is locked and cannot be modified."
          className="text-white [&_h2]:text-white [&_p]:text-slate-300 mb-8"
        />
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-6">
        <h3 className="text-yellow-300 font-semibold mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Pricing Locked
        </h3>
        <p className="text-yellow-200/80 text-sm leading-relaxed">
          All pricing in these estimates is locked and cannot be modified. You have full estimate context 
          for on-site execution, but pricing selections cannot be changed. This ensures consistent execution across teams.
        </p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4 text-slate-400">Loading handed-off estimates...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Status Filter Tabs */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedStatus === "all"
                    ? "bg-primary-600 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                All ({statusCounts.all})
              </button>
              <button
                onClick={() => setSelectedStatus("handed_off")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedStatus === "handed_off"
                    ? "bg-primary-600 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Handed Off ({statusCounts.handed_off})
              </button>
              <button
                onClick={() => setSelectedStatus("in_progress")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedStatus === "in_progress"
                    ? "bg-primary-600 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                In Progress ({statusCounts.in_progress})
              </button>
              <button
                onClick={() => setSelectedStatus("completed")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedStatus === "completed"
                    ? "bg-primary-600 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Completed ({statusCounts.completed})
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Handoffs List */}
          {filteredHandoffs.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-12 text-center">
              <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-400 text-lg">
                {selectedStatus === "all" ? "No estimates handed off yet." : `No estimates in ${getStatusLabel(selectedStatus)} status.`}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Estimates handed off by office staff or owners will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredHandoffs.map((handoff) => (
                <div
                  key={handoff.estimateId}
                  className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">
                          Estimate #{handoff.estimateId.slice(0, 8)}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(handoff.status)}`}>
                          {getStatusLabel(handoff.status)}
                        </span>
                        {handoff.estimate.lockedPricing && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            Pricing Locked
                          </span>
                        )}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 mb-1">Estimate Range (Locked)</p>
                          <p className="text-white font-medium">
                            {formatCurrency(handoff.estimate.range.min)} - {formatCurrency(handoff.estimate.range.max)}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-400 mb-1">Home Context</p>
                          <p className="text-white">
                            {handoff.estimate.input.squareFootage?.toLocaleString()} sqft • {handoff.estimate.input.preferences?.systemType || "Not specified"}
                          </p>
                          <p className="text-slate-400 text-xs mt-1">ZIP: {handoff.estimate.input.zipCode}</p>
                        </div>

                        <div>
                          <p className="text-slate-400 mb-1">Selected Tier</p>
                          <p className="text-white capitalize">
                            {handoff.estimate.selectedTier || "Not selected"}
                          </p>
                          {handoff.estimate.selectedAddOns && handoff.estimate.selectedAddOns.length > 0 && (
                            <p className="text-slate-400 text-xs mt-1">
                              {handoff.estimate.selectedAddOns.length} add-on(s) selected
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 text-right">
                      <p className="text-xs text-slate-400 mb-1">Handed Off</p>
                      <p className="text-sm text-white">{formatDate(handoff.handedOffAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <Link
                      href={`/contractor/tech/handoffs/${handoff.estimateId}`}
                      className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                    >
                      View Full Details →
                    </Link>
                    <div className="flex gap-2">
                      {handoff.status === "handed_off" && (
                        <button
                          onClick={() => handleStatusUpdate(handoff.estimateId, "in_progress")}
                          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {handoff.status === "in_progress" && (
                        <button
                          onClick={() => handleStatusUpdate(handoff.estimateId, "completed")}
                          className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </SecondarySection>
  );
}

