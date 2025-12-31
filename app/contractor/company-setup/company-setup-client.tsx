"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ContractorCompanySetupClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    licenseNumber: "",
    taxId: "",
    paymentMethod: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [companyCode, setCompanyCode] = useState<string | null>(null);

  // Fetch company code on mount
  useEffect(() => {
    // Check sessionStorage first (from registration)
    const storedCode = sessionStorage.getItem("companyCode");
    if (storedCode) {
      setCompanyCode(storedCode);
      sessionStorage.removeItem("companyCode"); // Clear after reading
    } else {
      // Fetch from API
      fetch("/api/contractor/company")
        .then((res) => res.json())
        .then((data) => {
          if (data.company?.companyCode) {
            setCompanyCode(data.company.companyCode);
          }
        })
        .catch(() => {
          // Ignore errors
        });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/contractor/company-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        setError(data.error || "Failed to save company setup");
        setLoading(false);
        return;
      }

      // Update company code if returned
      if (data.companyCode) {
        setCompanyCode(data.companyCode);
      }

      setSaved(true);
      setLoading(false);
      
      // Redirect to contractor flow after a moment
      setTimeout(() => {
        router.push("/contractor/dashboard");
      }, 1500);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Company Setup</h1>
          <p className="text-gray-600">Complete your company information to access contractor tools</p>
          {companyCode && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-1">Your Company Code:</p>
              <div className="flex items-center gap-2">
                <code className="text-2xl font-bold text-blue-700 bg-white px-4 py-2 rounded border border-blue-300">
                  {companyCode}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(companyCode);
                    alert("Company code copied to clipboard!");
                  }}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Share this code with your office staff and techs so they can join your company.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              Company setup saved! Redirecting...
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Company Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter company name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-2">
              Business Address *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter business address"
              rows={3}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium mb-2">
              License Number *
            </label>
            <input
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="Enter HVAC license number"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="taxId" className="block text-sm font-medium mb-2">
              Tax ID / EIN *
            </label>
            <input
              type="text"
              id="taxId"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              placeholder="Enter tax ID or EIN"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium mb-2">
              Payment Method *
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select payment method...</option>
              <option value="credit-card">Credit Card</option>
              <option value="bank-account">Bank Account</option>
            </select>
          </div>

          <div className="pt-4">
            <p className="text-xs text-gray-500 mb-4">
              * Required fields. Your information will be verified before contractor access is granted.
            </p>
            <button
              type="submit"
              disabled={loading || saved}
              className="w-full px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : saved ? "Saved!" : "Save & Continue"}
            </button>
          </div>
        </form>

        <div className="mt-8">
          <Link
            href="/"
            className="px-6 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

