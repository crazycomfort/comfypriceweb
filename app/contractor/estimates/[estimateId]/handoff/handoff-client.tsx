"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Estimate {
  id: string;
  estimateId: string;
  input: any;
  costBreakdown: {
    equipment: number;
    labor: number;
    materials: number;
    total: number;
  };
  range: {
    min: number;
    max: number;
  };
  selectedTier?: "good" | "better" | "best";
  selectedAddOns?: string[];
  status: "draft" | "handed_off" | "in_progress" | "completed";
  handedOffTo?: string;
  handedOffAt?: string;
  lockedPricing: boolean;
}

interface Tech {
  id: string;
  email: string;
  role: string;
}

export default function ContractorHandoffClient({ estimateId }: { estimateId: string }) {
  const router = useRouter();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [techs, setTechs] = useState<Tech[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [handingOff, setHandingOff] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch estimate
    fetch(`/api/contractor/estimates/${estimateId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (data.estimate) {
          setEstimate(data.estimate);
          // If already handed off, show who it was handed to
          if (data.estimate.handedOffTo) {
            setSelectedTechId(data.estimate.handedOffTo);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load estimate");
        setLoading(false);
      });

    // Fetch available techs
    fetch("/api/contractor/team")
      .then((res) => res.json())
      .then((data) => {
        if (data.team) {
          const techTeam = data.team.filter((member: Tech) => member.role === "tech");
          setTechs(techTeam);
        }
      })
      .catch((err) => {
        console.error("Failed to load techs:", err);
      });
  }, [estimateId]);

  const handleHandoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) {
      setError("Please select a tech to hand off to");
      return;
    }

    setHandingOff(true);
    setError("");

    try {
      const response = await fetch(`/api/contractor/estimates/${estimateId}/handoff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ techId: selectedTechId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to hand off estimate");
        setHandingOff(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/contractor/estimates/${estimateId}`);
      }, 2000);
    } catch (err) {
      setError("Failed to hand off estimate");
      setHandingOff(false);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4 text-slate-400">Loading estimate...</p>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
          Estimate not found
        </div>
      </div>
    );
  }

  const isHandedOff = estimate.status === "handed_off" || estimate.status === "in_progress" || estimate.status === "completed";
  const selectedTech = techs.find(t => t.id === selectedTechId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href={`/contractor/estimates/${estimateId}`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Estimate
        </Link>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Hand Off to Tech
        </h2>
        <p className="text-lg text-slate-300">
          Transfer this estimate to a tech for on-site execution. Pricing will be locked after handoff.
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
        <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pricing Lock After Handoff
        </h3>
        <p className="text-blue-200/80 text-sm leading-relaxed">
          Once you hand off this estimate to a tech, all pricing selections will be locked. 
          The tech will have full estimate context but cannot modify pricing. This ensures consistent execution across teams.
        </p>
      </div>

      {/* Estimate Summary */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Estimate Summary</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-400 mb-1">Estimate Range</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(estimate.range.min)} - {formatCurrency(estimate.range.max)}
            </p>
          </div>

          {estimate.selectedTier && (
            <div>
              <p className="text-sm text-slate-400 mb-1">Selected Tier</p>
              <p className="text-lg font-semibold text-white capitalize">{estimate.selectedTier}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-slate-400 mb-1">Location</p>
            <p className="text-white">ZIP: {estimate.input.zipCode}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-1">Home Size</p>
            <p className="text-white">{estimate.input.squareFootage?.toLocaleString()} sqft</p>
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-1">System Type</p>
            <p className="text-white">{estimate.input.preferences?.systemType || "Not specified"}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-1">Efficiency Level</p>
            <p className="text-white">{estimate.input.preferences?.efficiencyLevel || "Not specified"}</p>
          </div>
        </div>

        {estimate.selectedAddOns && estimate.selectedAddOns.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm text-slate-400 mb-2">Selected Add-Ons</p>
            <div className="flex flex-wrap gap-2">
              {estimate.selectedAddOns.map((addOnId, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-lg text-sm">
                  Add-On {idx + 1}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-sm text-slate-400 mb-2">Status</p>
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
            estimate.status === "draft" ? "bg-blue-500/20 text-blue-300" :
            estimate.status === "handed_off" ? "bg-yellow-500/20 text-yellow-300" :
            estimate.status === "in_progress" ? "bg-green-500/20 text-green-300" :
            "bg-slate-500/20 text-slate-300"
          }`}>
            {estimate.status === "draft" ? "Draft" :
             estimate.status === "handed_off" ? "Handed Off" :
             estimate.status === "in_progress" ? "In Progress" :
             "Completed"}
          </span>
          {estimate.handedOffTo && (
            <p className="text-xs text-slate-400 mt-2">
              Handed off to: {selectedTech?.email || "Unknown"}
            </p>
          )}
        </div>
      </div>

      {/* Handoff Form */}
      {!isHandedOff ? (
        <form onSubmit={handleHandoff} className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-6">
              Estimate handed off successfully! Redirecting...
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="techId" className="block text-sm font-semibold text-white mb-2">
              Select Tech
            </label>
            <select
              id="techId"
              value={selectedTechId}
              onChange={(e) => {
                setSelectedTechId(e.target.value);
                setError("");
              }}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a tech...</option>
              {techs.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.email}
                </option>
              ))}
            </select>
            {techs.length === 0 && (
              <p className="text-xs text-yellow-400 mt-2">
                No techs available. Add tech team members first.
              </p>
            )}
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-white mb-2">What happens after handoff:</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Pricing selections will be locked and cannot be modified</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Tech will receive full estimate context for on-site execution</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Status will transition to "Handed Off" and then "In Progress"</span>
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={handingOff || techs.length === 0}
            className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {handingOff ? "Handing Off..." : "Hand Off to Tech"}
          </button>
        </form>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Already Handed Off</h3>
            <p className="text-slate-300 mb-4">
              This estimate has already been handed off to a tech. Pricing is locked and cannot be modified.
            </p>
            {selectedTech && (
              <p className="text-sm text-slate-400 mb-6">
                Handed off to: {selectedTech.email}
              </p>
            )}
            <Link
              href={`/contractor/estimates/${estimateId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all"
            >
              View Estimate
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}



