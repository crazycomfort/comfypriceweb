"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import ContractorSignOut from "./ContractorSignOut";
import Logo from "./Logo";

interface ContractorInfo {
  role: string;
  email?: string;
}

export default function ContractorHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [contractorInfo, setContractorInfo] = useState<ContractorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch contractor info from session
    fetch("/api/contractor/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.contractor) {
          setContractorInfo({
            role: data.contractor.role,
            email: data.contractor.email,
          });
        }
        setLoading(false);
      })
      .catch(() => {
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
        return "Contractor";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner_admin":
        return "from-primary-600 to-purple-600";
      case "office":
        return "from-purple-600 to-pink-600";
      case "tech":
        return "from-primary-600 to-primary-700";
      default:
        return "from-primary-600 to-primary-700";
    }
  };

  const isDashboard = pathname?.includes("/dashboard") || pathname === "/contractor/dashboard";
  const isQuickEstimate = pathname?.includes("/c1") || pathname?.includes("/c2") || pathname?.includes("/c3") || pathname?.includes("/c4") || pathname?.includes("/tech/quick-estimate");
  const isCompanySetup = pathname?.includes("/company-setup");

  return (
    <div className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Branding & Role */}
          <div className="flex items-center gap-4">
            <Link
              href="/contractor/dashboard"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Logo size="sm" variant="dark-bg" />
              {!loading && contractorInfo && (
                <div className="hidden md:block ml-2">
                  <p className="text-xs text-slate-400">
                    {getRoleLabel(contractorInfo.role)}
                    {contractorInfo.email && ` • ${contractorInfo.email.split("@")[0]}`}
                  </p>
                </div>
              )}
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1 ml-6">
              <Link
                href="/contractor/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDashboard
                    ? "bg-primary-600/20 text-primary-300 border border-primary-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                } cursor-pointer`}
              >
                Dashboard
              </Link>
              <Link
                href="/contractor/c1"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isQuickEstimate
                    ? "bg-primary-600/20 text-primary-300 border border-primary-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                } cursor-pointer`}
              >
                Quick Estimate
              </Link>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition-colors text-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <ContractorSignOut />
          </div>
        </div>
      </div>
    </div>
  );
}

