"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CompanyProfileData {
  id: string;
  name: string | null;
  address: string | null;
  licenseNumber: string | null;
  // Additional profile fields for homeowner trust
  yearsInBusiness: number | null;
  liabilityInsurance: string | null;
  workersCompInsurance: string | null;
  bondingInfo: string | null;
  certifications: string | null;
  serviceArea: string | null;
  numberOfEmployees: number | null;
  bbbRating: string | null;
  isVerified: boolean;
}

export default function ContractorProfileClient() {
  const [company, setCompany] = useState<CompanyProfileData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    licenseNumber: "",
    yearsInBusiness: "",
    liabilityInsurance: "",
    workersCompInsurance: "",
    bondingInfo: "",
    certifications: "",
    serviceArea: "",
    numberOfEmployees: "",
    bbbRating: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

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
            yearsInBusiness: data.company.yearsInBusiness?.toString() || "",
            liabilityInsurance: data.company.liabilityInsurance || "",
            workersCompInsurance: data.company.workersCompInsurance || "",
            bondingInfo: data.company.bondingInfo || "",
            certifications: data.company.certifications || "",
            serviceArea: data.company.serviceArea || "",
            numberOfEmployees: data.company.numberOfEmployees?.toString() || "",
            bbbRating: data.company.bbbRating || "",
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load company profile");
        setLoading(false);
      });
  }, []);

  // Auto-save on field change (debounced)
  useEffect(() => {
    if (!company || loading) return;
    
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleAutoSave = async () => {
    if (saving) return;
    
    setAutoSaveStatus("saving");
    setSaving(true);

    try {
      const response = await fetch("/api/contractor/company-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          yearsInBusiness: formData.yearsInBusiness ? parseInt(formData.yearsInBusiness) : null,
          numberOfEmployees: formData.numberOfEmployees ? parseInt(formData.numberOfEmployees) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAutoSaveStatus("unsaved");
        setSaving(false);
        return;
      }

      setAutoSaveStatus("saved");
      setSaving(false);
      
      // Update local state
      if (data.company) {
        setCompany(data.company);
      }
    } catch (err) {
      setAutoSaveStatus("unsaved");
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setAutoSaveStatus("unsaved");
    setError("");
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAutoSave();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
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
          Company Profile
        </h2>
        <p className="text-lg text-slate-300">
          Build homeowner trust with credibility and compliance information
        </p>
      </div>

      {/* How Data Is Used */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
        <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How This Information Is Used
        </h3>
        <p className="text-blue-200/80 text-sm leading-relaxed">
          This profile information helps build homeowner trust and demonstrates your company's credibility. 
          When homeowners request appointments, they can see verified information about your licensing, 
          insurance, and business history. This information is only displayed to homeowners who request 
          appointments with your company—it is not publicly searchable or shared with third parties.
        </p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4 text-slate-400">Loading profile...</p>
        </div>
      )}

      {!loading && (
        <form onSubmit={handleManualSave} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg">
              Profile saved successfully!
            </div>
          )}

          {/* Auto-save status */}
          <div className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-2">
            <span className="text-sm text-slate-400">
              {autoSaveStatus === "saving" && "Saving changes..."}
              {autoSaveStatus === "saved" && "All changes saved"}
              {autoSaveStatus === "unsaved" && "Unsaved changes"}
            </span>
            {autoSaveStatus === "saving" && (
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
            )}
            {autoSaveStatus === "saved" && (
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          {/* Basic Information Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Basic Information</h3>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-white mb-2">
                  Business Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter business address"
                />
              </div>

              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-semibold text-white mb-2">
                  HVAC License Number
                </label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter HVAC license number"
                />
                <p className="text-xs text-slate-400 mt-1">This helps homeowners verify your licensing status</p>
              </div>
            </div>
          </div>

          {/* Credibility & Compliance Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Credibility & Compliance</h3>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="yearsInBusiness" className="block text-sm font-semibold text-white mb-2">
                  Years in Business
                </label>
                <input
                  type="number"
                  id="yearsInBusiness"
                  name="yearsInBusiness"
                  value={formData.yearsInBusiness}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 15"
                />
                <p className="text-xs text-slate-400 mt-1">Demonstrates business stability and experience</p>
              </div>

              <div>
                <label htmlFor="liabilityInsurance" className="block text-sm font-semibold text-white mb-2">
                  Liability Insurance Coverage
                </label>
                <input
                  type="text"
                  id="liabilityInsurance"
                  name="liabilityInsurance"
                  value={formData.liabilityInsurance}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., $1,000,000 general liability"
                />
                <p className="text-xs text-slate-400 mt-1">Shows you're properly insured</p>
              </div>

              <div>
                <label htmlFor="workersCompInsurance" className="block text-sm font-semibold text-white mb-2">
                  Workers' Compensation Insurance
                </label>
                <input
                  type="text"
                  id="workersCompInsurance"
                  name="workersCompInsurance"
                  value={formData.workersCompInsurance}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Current and active"
                />
                <p className="text-xs text-slate-400 mt-1">Required in most states for contractor work</p>
              </div>

              <div>
                <label htmlFor="bondingInfo" className="block text-sm font-semibold text-white mb-2">
                  Bonding Information
                </label>
                <input
                  type="text"
                  id="bondingInfo"
                  name="bondingInfo"
                  value={formData.bondingInfo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., $50,000 surety bond"
                />
                <p className="text-xs text-slate-400 mt-1">Optional but adds credibility</p>
              </div>
            </div>
          </div>

          {/* Business Details Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Business Details</h3>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="serviceArea" className="block text-sm font-semibold text-white mb-2">
                  Service Area
                </label>
                <input
                  type="text"
                  id="serviceArea"
                  name="serviceArea"
                  value={formData.serviceArea}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Metro area, 50-mile radius"
                />
                <p className="text-xs text-slate-400 mt-1">Helps homeowners understand your coverage area</p>
              </div>

              <div>
                <label htmlFor="numberOfEmployees" className="block text-sm font-semibold text-white mb-2">
                  Number of Employees
                </label>
                <input
                  type="number"
                  id="numberOfEmployees"
                  name="numberOfEmployees"
                  value={formData.numberOfEmployees}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 12"
                />
                <p className="text-xs text-slate-400 mt-1">Shows business scale and capacity</p>
              </div>

              <div>
                <label htmlFor="certifications" className="block text-sm font-semibold text-white mb-2">
                  Certifications & Memberships
                </label>
                <textarea
                  id="certifications"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., NATE certified, ACCA member, EPA certified"
                />
                <p className="text-xs text-slate-400 mt-1">List relevant industry certifications and memberships</p>
              </div>

              <div>
                <label htmlFor="bbbRating" className="block text-sm font-semibold text-white mb-2">
                  Better Business Bureau Rating (Optional)
                </label>
                <input
                  type="text"
                  id="bbbRating"
                  name="bbbRating"
                  value={formData.bbbRating}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., A+"
                />
                <p className="text-xs text-slate-400 mt-1">Optional third-party verification</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between bg-slate-800/50 rounded-lg px-6 py-4">
            <p className="text-sm text-slate-400">
              Changes are saved automatically. You can also save manually.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? "Saving..." : "Save Now"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

