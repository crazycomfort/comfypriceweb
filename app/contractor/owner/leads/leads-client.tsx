"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type LeadStatus = "new" | "contacted" | "scheduled" | "completed" | "lost";

type LeadQualityIndicator = 
  | "High intent"
  | "Reviewed options"
  | "Viewed financing"
  | "Saved/shared estimate";

interface Lead {
  id: string;
  status: LeadStatus;
  name: string;
  contactMethod: "email" | "phone";
  contactInfo: string; // Email or phone, not both prominently displayed
  zipCode: string;
  squareFootage: string; // Range like "2,000-2,500"
  systemType: string;
  estimateRange: {
    min: number;
    max: number;
  };
  preferredTier?: "good" | "better" | "best";
  timeline?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  qualityIndicators?: LeadQualityIndicator[];
  readinessTier?: "Exploring options" | "Actively planning" | "Ready for on-site evaluation";
  readinessMetadata?: {
    expectedTimeline: string;
    recommendedAction: string;
  };
}

export default function ContractorLeadsClient() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | "all">("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetch("/api/contractor/leads")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (data.leads) {
          setLeads(data.leads);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load leads");
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const response = await fetch("/api/contractor/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: newStatus }),
      });

      if (response.ok) {
        setLeads(prev => prev.map(lead =>
          lead.id === leadId
            ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() }
            : lead
        ));
      }
    } catch (err) {
      console.error("Failed to update lead status:", err);
    }
  };

  const handleAddNote = async (leadId: string, note: string) => {
    try {
      const response = await fetch("/api/contractor/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, notes: note }),
      });

      if (response.ok) {
        setLeads(prev => prev.map(lead =>
          lead.id === leadId
            ? { ...lead, notes: note, updatedAt: new Date().toISOString() }
            : lead
        ));
        setSelectedLead(null);
      }
    } catch (err) {
      console.error("Failed to add note:", err);
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "contacted":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "scheduled":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "completed":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
      case "lost":
        return "bg-red-500/20 text-red-300 border-red-500/30";
    }
  };

  const getStatusLabel = (status: LeadStatus) => {
    switch (status) {
      case "new":
        return "New";
      case "contacted":
        return "Contacted";
      case "scheduled":
        return "Scheduled";
      case "completed":
        return "Completed";
      case "lost":
        return "Lost";
    }
  };

  const filteredLeads = selectedStatus === "all"
    ? leads
    : leads.filter(lead => lead.status === selectedStatus);

  const statusCounts = {
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    scheduled: leads.filter(l => l.status === "scheduled").length,
    completed: leads.filter(l => l.status === "completed").length,
    lost: leads.filter(l => l.status === "lost").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/contractor/owner/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Pre-Qualified Homeowners
        </h2>
        <p className="text-lg text-slate-300">
          Review homeowners who completed structured estimates and requested next steps. These homeowners are pre-educated about pricing, have realistic expectations, and understand that on-site evaluation may refine pricing—this saves you time explaining basics.
        </p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4 text-slate-400">Loading leads...</p>
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
                All ({leads.length})
              </button>
              <button
                onClick={() => setSelectedStatus("new")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedStatus === "new"
                    ? "bg-primary-600 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                New ({statusCounts.new})
              </button>
              <button
                onClick={() => setSelectedStatus("contacted")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedStatus === "contacted"
                    ? "bg-primary-600 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Contacted ({statusCounts.contacted})
              </button>
              <button
                onClick={() => setSelectedStatus("scheduled")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedStatus === "scheduled"
                    ? "bg-primary-600 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Scheduled ({statusCounts.scheduled})
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
              <button
                onClick={() => setSelectedStatus("lost")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedStatus === "lost"
                    ? "bg-primary-600 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Lost ({statusCounts.lost})
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Leads List */}
          {filteredLeads.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-12 text-center">
              <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-400 text-lg">
                {selectedStatus === "all" ? "No leads yet." : `No leads in ${getStatusLabel(selectedStatus)} status.`}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Homeowner appointment requests will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-white">
                          {lead.name.split(" ")[0]} {lead.name.split(" ").length > 1 ? lead.name.split(" ")[1][0] + "." : ""}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(lead.status)}`}>
                          {getStatusLabel(lead.status)}
                        </span>
                        {/* Readiness Tier - Most Important */}
                        {lead.readinessTier && (
                          <span
                            className={`px-3 py-1 rounded text-xs font-semibold border ${
                              lead.readinessTier === "Ready for on-site evaluation"
                                ? "bg-green-500/20 text-green-200 border-green-500/30"
                                : lead.readinessTier === "Actively planning"
                                ? "bg-blue-500/20 text-blue-200 border-blue-500/30"
                                : "bg-slate-500/20 text-slate-200 border-slate-500/30"
                            }`}
                          >
                            {lead.readinessTier}
                          </span>
                        )}
                        {/* Quality Indicators */}
                        {lead.qualityIndicators && lead.qualityIndicators.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {lead.qualityIndicators.map((indicator, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded text-xs font-medium bg-primary-500/20 text-primary-200 border border-primary-500/30"
                              >
                                {indicator}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 mb-1">Estimate Range</p>
                          <p className="text-white font-medium">
                            {formatCurrency(lead.estimateRange.min)} - {formatCurrency(lead.estimateRange.max)}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-400 mb-1">Home Context</p>
                          <p className="text-white">
                            {lead.squareFootage} sqft • {lead.systemType}
                          </p>
                          <p className="text-slate-400 text-xs mt-1">ZIP: {lead.zipCode}</p>
                        </div>

                        <div>
                          <p className="text-slate-400 mb-1">Contact</p>
                          <p className="text-white">
                            {lead.contactMethod === "email" ? (
                              <a href={`mailto:${lead.contactInfo}`} className="hover:text-primary-400 transition-colors">
                                {lead.contactInfo}
                              </a>
                            ) : (
                              <a href={`tel:${lead.contactInfo}`} className="hover:text-primary-400 transition-colors">
                                {lead.contactInfo}
                              </a>
                            )}
                          </p>
                          {lead.timeline && (
                            <p className="text-slate-400 text-xs mt-1">Timeline: {lead.timeline}</p>
                          )}
                        </div>
                      </div>

                      {lead.preferredTier && (
                        <div className="mt-3">
                          <span className="text-xs text-slate-400">Preferred tier: </span>
                          <span className="text-xs text-white font-medium capitalize">{lead.preferredTier}</span>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 text-right">
                      <p className="text-xs text-slate-400 mb-1">Received</p>
                      <p className="text-sm text-white">{formatDate(lead.createdAt)}</p>
                      <p className="text-xs text-slate-500">{formatTime(lead.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Lead Details</h3>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Update */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Update Status</label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as LeadStatus;
                    handleStatusChange(selectedLead.id, newStatus);
                    setSelectedLead({ ...selectedLead, status: newStatus });
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              {/* Lead Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Name</p>
                  <p className="text-white">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Contact</p>
                  <p className="text-white">
                    {selectedLead.contactMethod === "email" ? (
                      <a href={`mailto:${selectedLead.contactInfo}`} className="hover:text-primary-400 transition-colors">
                        {selectedLead.contactInfo}
                      </a>
                    ) : (
                      <a href={`tel:${selectedLead.contactInfo}`} className="hover:text-primary-400 transition-colors">
                        {selectedLead.contactInfo}
                      </a>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Location</p>
                  <p className="text-white">ZIP: {selectedLead.zipCode}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Home Size</p>
                  <p className="text-white">{selectedLead.squareFootage} sqft</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">System Type</p>
                  <p className="text-white">{selectedLead.systemType}</p>
                </div>
                {selectedLead.preferredTier && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Preferred Tier</p>
                    <p className="text-white capitalize">{selectedLead.preferredTier}</p>
                  </div>
                )}
                {selectedLead.timeline && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Timeline</p>
                    <p className="text-white">{selectedLead.timeline}</p>
                  </div>
                )}
              </div>

              {/* Readiness Tier - Most Important */}
              {selectedLead.readinessTier && (
                <div className={`rounded-lg p-4 border ${
                  selectedLead.readinessTier === "Ready for on-site evaluation"
                    ? "bg-green-500/10 border-green-500/30"
                    : selectedLead.readinessTier === "Actively planning"
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-slate-500/10 border-slate-500/30"
                }`}>
                  <p className={`text-sm font-semibold mb-2 ${
                    selectedLead.readinessTier === "Ready for on-site evaluation"
                      ? "text-green-300"
                      : selectedLead.readinessTier === "Actively planning"
                      ? "text-blue-300"
                      : "text-slate-300"
                  }`}>
                    Readiness: {selectedLead.readinessTier}
                  </p>
                  {selectedLead.readinessMetadata && (
                    <div className="space-y-1 text-xs">
                      <p className="text-slate-300">
                        <span className="font-medium">Expected timeline:</span> {selectedLead.readinessMetadata.expectedTimeline}
                      </p>
                      <p className="text-slate-300">
                        <span className="font-medium">Recommended action:</span> {selectedLead.readinessMetadata.recommendedAction}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Quality Indicators */}
              {selectedLead.qualityIndicators && selectedLead.qualityIndicators.length > 0 && (
                <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
                  <p className="text-sm text-primary-300 mb-3 font-semibold">Homeowner Engagement</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.qualityIndicators.map((indicator, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded text-xs font-medium bg-primary-500/20 text-primary-200 border border-primary-500/30"
                      >
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Estimate Range */}
              <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
                <p className="text-sm text-primary-300 mb-2">Estimate Range (Totals Only)</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(selectedLead.estimateRange.min)} - {formatCurrency(selectedLead.estimateRange.max)}
                </p>
                <p className="text-xs text-primary-300/80 mt-2">
                  This is the total flat-rate range the homeowner saw. No pricing breakdowns are shown.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Notes</label>
                <textarea
                  value={selectedLead.notes || ""}
                  onChange={(e) => setSelectedLead({ ...selectedLead, notes: e.target.value })}
                  onBlur={(e) => handleAddNote(selectedLead.id, e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add notes about this lead..."
                />
              </div>

              {/* Timestamps */}
              <div className="text-xs text-slate-400 space-y-1">
                <p>Created: {formatDate(selectedLead.createdAt)} at {formatTime(selectedLead.createdAt)}</p>
                <p>Last updated: {formatDate(selectedLead.updatedAt)} at {formatTime(selectedLead.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

