"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ContractorRegister() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner_admin" | "office" | "tech">("tech");
  const [companyCode, setCompanyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/contractor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, companyCode: role !== "owner_admin" ? companyCode : undefined }),
      });

      // Check if response has content before parsing
      const text = await response.text();
      if (!text) {
        setError("Server error: Empty response. Please try again.");
        setLoading(false);
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        setError("Server error: Invalid response. Please try again.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        // Show detailed error message if available
        let errorMessage = data.error || "Registration failed. Please try again.";
        
        // Always show details if available (helps with debugging)
        if (data.details) {
          errorMessage += `\n\nDetails: ${data.details}`;
        }
        
        console.error("Registration error:", {
          status: response.status,
          error: data.error,
          details: data.details,
          fullData: data
        });
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Check if registration was successful
      if (data.success) {
        // Only owner_admin goes to settings, others go to dashboard
        if (role === "owner_admin") {
          // Store company code in sessionStorage if provided (for display on settings page)
          if (data.companyCode) {
            sessionStorage.setItem("companyCode", data.companyCode);
          }
          router.push("/contractor/owner/settings");
        } else {
          router.push("/contractor/dashboard");
        }
      } else {
        setError("Registration failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Registration request failed:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred. Please try again.";
      setError(`Network error: ${errorMessage}\n\nPlease check your connection and try again.`);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Contractor Registration
          </h1>
          <p className="text-lg text-gray-600">
            Create your contractor account to get started
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <div className="whitespace-pre-line text-sm">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                placeholder="you@company.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white placeholder:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white placeholder:text-gray-400"
              />
              <p className="mt-2 text-sm text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-900 mb-2">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as "owner_admin" | "office" | "tech");
                  setError("");
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white"
              >
                <option value="tech">Tech</option>
                <option value="office">Office</option>
                <option value="owner_admin">Owner Admin</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Select your role in the company
              </p>
            </div>

            {role !== "owner_admin" && (
              <div>
                <label htmlFor="companyCode" className="block text-sm font-semibold text-gray-900 mb-2">
                  Company Code *
                </label>
                <input
                  type="text"
                  id="companyCode"
                  value={companyCode}
                  onChange={(e) => {
                    setCompanyCode(e.target.value.toUpperCase());
                    setError("");
                  }}
                  required
                  placeholder="Enter company invitation code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white placeholder:text-gray-400"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Get this code from your company owner/admin. This links you to your company.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/contractor/signin" className="text-primary-700 hover:text-primary-700 font-medium transition-colors cursor-pointer">
              Sign in here
            </Link>
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
