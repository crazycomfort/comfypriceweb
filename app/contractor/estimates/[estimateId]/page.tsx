"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ContractorHeader from "@/app/components/ContractorHeader";
import ErrorMessage from "@/app/components/ErrorMessage";
import PageLoader from "@/app/components/PageLoader";

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
        } else {
          setError("Estimate not found");
        }
        setLoading(false);
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Estimate Details
          </h1>
          <p className="text-slate-300">Created {formatDate(estimate.createdAt)}</p>
        </div>

        {/* Price Range Card */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-2xl p-8 mb-6 text-white">
          <p className="text-primary-100 text-sm uppercase tracking-wide mb-2">Estimated Price Range</p>
          <div className="text-5xl md:text-6xl font-bold mb-4">
            {formatCurrency(estimate.range.min)} - {formatCurrency(estimate.range.max)}
          </div>
          <p className="text-primary-100">All-inclusive pricing • No hidden fees</p>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Cost Breakdown</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <p className="text-slate-400 text-sm mb-2">Equipment</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(estimate.costBreakdown.equipment)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <p className="text-slate-400 text-sm mb-2">Labor</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(estimate.costBreakdown.labor)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <p className="text-slate-400 text-sm mb-2">Materials</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(estimate.costBreakdown.materials)}</p>
            </div>
            <div className="bg-primary-500/20 rounded-xl p-6 border border-primary-500/30">
              <p className="text-primary-200 text-sm mb-2">Total</p>
              <p className="text-3xl font-bold text-primary-300">{formatCurrency(estimate.costBreakdown.total)}</p>
            </div>
          </div>
        </div>

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
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer"
          >
            Create New Estimate
          </Link>
        </div>
      </div>
    </main>
  );
}

