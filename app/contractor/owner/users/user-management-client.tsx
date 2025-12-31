"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TeamMember {
  id: string;
  email: string;
  role: "owner_admin" | "office" | "tech";
  createdAt: string;
}

export default function UserManagementClient() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/contractor/team")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setTeam(data.team || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load team members");
        setLoading(false);
      });
  }, []);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner_admin":
        return "Owner Admin";
      case "office":
        return "Office";
      case "tech":
        return "Tech";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner_admin":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "office":
        return "bg-pink-500/20 text-pink-300 border-pink-500/30";
      case "tech":
        return "bg-primary-500/20 text-primary-300 border-primary-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
          Team Credibility
        </h2>
        <p className="text-lg text-slate-300">
          Manage team access to pricing tools and maintain professional standards across your organization
        </p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4 text-slate-400">Loading team credentials...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Team Members</h3>
              <span className="text-slate-400 text-sm">
                {team.length} {team.length === 1 ? "member" : "members"}
              </span>
            </div>

            {team.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>No team members found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {team.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white/5 rounded-lg border border-white/10 p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{member.email}</p>
                            <p className="text-slate-400 text-sm">
                              Joined {formatDate(member.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(
                            member.role
                          )}`}
                        >
                          {getRoleLabel(member.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-blue-300 font-semibold mb-1">Adding Team Members</p>
                <p className="text-blue-200/80 text-sm">
                  Share your company code with team members so they can register and join your company. 
                  You can find your company code in Company Setup.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

