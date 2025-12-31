"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContractorSignOut() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    
    setSigningOut(true);
    
    try {
      // Clear session on server
      await fetch("/api/contractor/signout", {
        method: "POST",
      });
      
      // Clear local storage
      sessionStorage.removeItem("contractorEstimateInput");
      sessionStorage.removeItem("contractorEstimateId");
      
      // Redirect to home
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      // Still redirect even if API call fails
      sessionStorage.clear();
      router.push("/");
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={signingOut}
      className="inline-flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      title="Sign Out"
    >
      {signingOut ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing out...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </>
      )}
    </button>
  );
}


