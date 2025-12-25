"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LoadingSpinner from "./LoadingSpinner";

interface Estimate {
  estimateId: string;
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
  createdAt?: string;
}

interface EstimateHistoryProps {
  limit?: number;
  showViewAll?: boolean;
}

export default function EstimateHistory({ limit = 5, showViewAll = true }: EstimateHistoryProps) {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/contractor/estimates")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load estimates");
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.estimates) {
          // Remove duplicates based on estimateId
          const uniqueEstimates = Array.from(
            new Map(data.estimates.map((est: Estimate) => [est.estimateId, est])).values()
          );
          setEstimates(uniqueEstimates.slice(0, limit));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load estimates");
        setLoading(false);
      });
  }, [limit]);

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
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return "Recently";
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
        <div className="text-center py-8">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (estimates.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-4">Recent Estimates</h3>
        <div className="text-center py-8">
          <svg
            className="w-16 h-16 text-slate-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-slate-400 mb-2">No estimates yet</p>
          <p className="text-slate-500 text-sm">Generate your first estimate to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Recent Estimates</h3>
        {showViewAll && (
          <Link
            href="/contractor/estimates"
            className="text-primary-300 hover:text-primary-200 text-sm font-medium transition-colors cursor-pointer"
          >
            View All →
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {estimates.map((estimate, index) => (
          <Link
            key={`${estimate.estimateId}-${index}`}
            href={`/contractor/estimates/${estimate.estimateId}`}
            className="block bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {formatCurrency(estimate.range.min)} - {formatCurrency(estimate.range.max)}
                  </p>
                  <p className="text-slate-400 text-xs">{formatDate(estimate.createdAt)}</p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-slate-400"
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
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-4 text-xs text-slate-400">
              <span>Equipment: {formatCurrency(estimate.costBreakdown.equipment)}</span>
              <span>Labor: {formatCurrency(estimate.costBreakdown.labor)}</span>
              <span>Total: {formatCurrency(estimate.costBreakdown.total)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

