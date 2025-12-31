"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CompanyData {
  id: string;
  name: string | null;
  address: string | null;
  licenseNumber: string | null;
  taxId: string | null;
  paymentMethod: string | null;
  companyCode: string | null;
  isVerified: boolean;
}

export default function SettingsClient() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    licenseNumber: "",
    taxId: "",
    paymentMethod: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/contractor/company")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (data.company) {
          setCompany(data.company);
          setFormData({
            name: data.company.name || "",
            address: data.company.address || "",
            licenseNumber: data.company.licenseNumber || "",
            taxId: data.company.taxId || "",
            paymentMethod: data.company.paymentMethod || "",
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load company settings");
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const response = await fetch("/api/contractor/company-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save settings");
        setSaving(false);
        return;
      }

      setSuccess(true);
      setSaving(false);
      
      // Update local state
      if (data.company) {
        setCompany(data.company);
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("An error occurred while saving");
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const copyCompanyCode = () => {
    if (company?.companyCode) {
      navigator.clipboard.writeText(company.companyCode);
      alert("Company code copied to clipboard!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          Company Settings
        </h2>
        <p className="text-lg text-slate-300">
          Manage your company information and preferences
        </p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4 text-slate-400">Loading settings...</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {/* Company Code Display */}
          {company?.companyCode && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 font-semibold mb-1">Company Code</p>
                  <p className="text-blue-200/80 text-sm mb-3">
                    Share this code with team members so they can join your company
                  </p>
                  <code className="text-2xl font-bold text-blue-300 bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500/30">
                    {company.companyCode}
                  </code>
                </div>
                <button
                  onClick={copyCompanyCode}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Settings Form */}
          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-6">
                Settings saved successfully!
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-white mb-2">
                  Business Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter business address"
                />
              </div>

              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-semibold text-white mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter HVAC license number"
                />
              </div>

              <div>
                <label htmlFor="taxId" className="block text-sm font-semibold text-white mb-2">
                  Tax ID / EIN *
                </label>
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter tax ID or EIN"
                />
              </div>

              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-semibold text-white mb-2">
                  Payment Method *
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select payment method...</option>
                  <option value="credit-card">Credit Card</option>
                  <option value="bank-account">Bank Account</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}



