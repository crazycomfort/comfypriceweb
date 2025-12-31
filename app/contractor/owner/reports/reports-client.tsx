"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  totalEstimates: number;
  recentEstimates: number;
  totalTeamMembers: number;
  totalValue: number;
  roleCounts: {
    owner_admin: number;
    office: number;
    tech: number;
  };
}

export default function ReportsClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/contractor/reports")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setStats(data.stats);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load reports");
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
          Trust-Building Insights
        </h2>
        <p className="text-lg text-slate-300">
          Measure how homeowners engage with your pricing authority and track the quality of qualified leads
        </p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4 text-slate-400">Loading trust-building insights...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {!loading && !error && stats && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Estimates */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-500/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalEstimates}</h3>
            <p className="text-slate-400 text-sm">Total Estimates</p>
          </div>

          {/* Recent Estimates */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.recentEstimates}</h3>
            <p className="text-slate-400 text-sm">Last 30 Days</p>
          </div>

          {/* Team Members */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalTeamMembers}</h3>
            <p className="text-slate-400 text-sm">Team Members</p>
          </div>

          {/* Total Value */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{formatCurrency(stats.totalValue)}</h3>
            <p className="text-slate-400 text-sm">Total Estimate Value</p>
          </div>
        </div>
      )}

      {!loading && !error && stats && (
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Team Composition</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Owner Admin</span>
                <span className="text-white font-bold text-lg">{stats.roleCounts.owner_admin}</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Office Staff</span>
                <span className="text-white font-bold text-lg">{stats.roleCounts.office}</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Tech Staff</span>
                <span className="text-white font-bold text-lg">{stats.roleCounts.tech}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

