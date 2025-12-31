"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PricebookTier {
  id: "good" | "better" | "best";
  name: string;
  totalPrice: number | null;
  description: string;
}

interface AddOn {
  id: string;
  name: string;
  totalPrice: number | null;
  description: string;
  compatibleWith: ("good" | "better" | "best")[];
}

interface PricebookData {
  tiers: PricebookTier[];
  addOns: AddOn[];
}

export default function ContractorPricebookClient() {
  const [pricebook, setPricebook] = useState<PricebookData>({
    tiers: [
      { id: "good", name: "Good", totalPrice: null, description: "Reliable, efficient system that meets basic needs" },
      { id: "better", name: "Better", totalPrice: null, description: "Enhanced performance with modern features and improved efficiency" },
      { id: "best", name: "Best", totalPrice: null, description: "Premium system with top-tier efficiency and smart home integration" },
    ],
    addOns: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  useEffect(() => {
    fetch("/api/contractor/pricebook")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (data.pricebook) {
          setPricebook(data.pricebook);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load pricebook");
        setLoading(false);
      });
  }, []);

  // Auto-save on field change (debounced)
  useEffect(() => {
    if (loading) return;
    
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricebook]);

  const handleAutoSave = async () => {
    if (saving) return;
    
    setAutoSaveStatus("saving");
    setSaving(true);

    try {
      const response = await fetch("/api/contractor/pricebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricebook }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAutoSaveStatus("unsaved");
        setSaving(false);
        return;
      }

      setAutoSaveStatus("saved");
      setSaving(false);
    } catch (err) {
      setAutoSaveStatus("unsaved");
      setSaving(false);
    }
  };

  const handleTierChange = (tierId: "good" | "better" | "best", field: "totalPrice" | "description", value: number | string) => {
    setPricebook(prev => ({
      ...prev,
      tiers: prev.tiers.map(tier => 
        tier.id === tierId 
          ? { ...tier, [field]: value }
          : tier
      ),
    }));
    setAutoSaveStatus("unsaved");
    setError("");
  };

  const handleAddOnChange = (addOnId: string, field: "name" | "totalPrice" | "description" | "compatibleWith", value: string | number | ("good" | "better" | "best")[]) => {
    setPricebook(prev => ({
      ...prev,
      addOns: prev.addOns.map(addOn =>
        addOn.id === addOnId
          ? { ...addOn, [field]: value }
          : addOn
      ),
    }));
    setAutoSaveStatus("unsaved");
    setError("");
  };

  const handleAddAddOn = () => {
    const newAddOn: AddOn = {
      id: `addon-${Date.now()}`,
      name: "",
      totalPrice: null,
      description: "",
      compatibleWith: [],
    };
    setPricebook(prev => ({
      ...prev,
      addOns: [...prev.addOns, newAddOn],
    }));
    setAutoSaveStatus("unsaved");
  };

  const handleRemoveAddOn = (addOnId: string) => {
    setPricebook(prev => ({
      ...prev,
      addOns: prev.addOns.filter(addOn => addOn.id !== addOnId),
    }));
    setAutoSaveStatus("unsaved");
  };

  const handleToggleCompatibility = (addOnId: string, tierId: "good" | "better" | "best") => {
    setPricebook(prev => ({
      ...prev,
      addOns: prev.addOns.map(addOn =>
        addOn.id === addOnId
          ? {
              ...addOn,
              compatibleWith: addOn.compatibleWith.includes(tierId)
                ? addOn.compatibleWith.filter(id => id !== tierId)
                : [...addOn.compatibleWith, tierId],
            }
          : addOn
      ),
    }));
    setAutoSaveStatus("unsaved");
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAutoSave();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const parseCurrency = (value: string): number | null => {
    const cleaned = value.replace(/[^0-9]/g, "");
    return cleaned ? parseInt(cleaned, 10) : null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          Your Pricing Authority Configuration
        </h2>
        <p className="text-lg text-slate-300">
          Configure your pricing ranges that educate homeowners and build trust. Set Good/Better/Best tiers that demonstrate your pricing authority.
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
        <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Building Trust Through Pricing Authority
        </h3>
        <p className="text-blue-200/80 text-sm leading-relaxed">
          All prices you set here are displayed as flat-rate totals to homeowners. No labor, margin, or equipment breakdowns are shown. 
          This builds trust through transparency while protecting your professional pricing structure and maintaining your pricing authority.
        </p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4 text-slate-400">Loading pricing authority configuration...</p>
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
              Pricing authority configuration saved successfully!
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

          {/* Good/Better/Best Tiers */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Good / Better / Best Tiers</h3>
            <p className="text-slate-400 text-sm mb-6">
              Set flat-rate totals for each tier. These are the base prices homeowners will see.
            </p>
            
            <div className="space-y-6">
              {pricebook.tiers.map((tier) => (
                <div key={tier.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">{tier.name}</h4>
                    <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                      {tier.id.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Total Price (Flat Rate)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="text"
                          value={tier.totalPrice !== null ? tier.totalPrice.toString() : ""}
                          onChange={(e) => {
                            const value = parseCurrency(e.target.value);
                            handleTierChange(tier.id, "totalPrice", value);
                          }}
                          placeholder="0"
                          className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        This is the total flat-rate price homeowners will see. No breakdowns shown.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Description
                      </label>
                      <textarea
                        value={tier.description}
                        onChange={(e) => handleTierChange(tier.id, "description", e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Brief description of what this tier includes"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add-Ons Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Add-Ons</h3>
                <p className="text-slate-400 text-sm">
                  Configure optional add-ons and specify which tiers they're compatible with.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddAddOn}
                className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all"
              >
                + Add Add-On
              </button>
            </div>

            {pricebook.addOns.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>No add-ons configured yet. Click "Add Add-On" to create one.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pricebook.addOns.map((addOn) => (
                  <div key={addOn.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Add-On</h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveAddOn(addOn.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Add-On Name
                        </label>
                        <input
                          type="text"
                          value={addOn.name}
                          onChange={(e) => handleAddOnChange(addOn.id, "name", e.target.value)}
                          placeholder="e.g., Smart Thermostat, Zoning System"
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Total Price (Flat Rate)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                          <input
                            type="text"
                            value={addOn.totalPrice !== null ? addOn.totalPrice.toString() : ""}
                            onChange={(e) => {
                              const value = parseCurrency(e.target.value);
                              handleAddOnChange(addOn.id, "totalPrice", value);
                            }}
                            placeholder="0"
                            className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Description
                        </label>
                        <textarea
                          value={addOn.description}
                          onChange={(e) => handleAddOnChange(addOn.id, "description", e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="What does this add-on include?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Compatible With
                        </label>
                        <p className="text-xs text-slate-400 mb-3">
                          Select which tiers this add-on can be added to.
                        </p>
                        <div className="flex gap-4">
                          {pricebook.tiers.map((tier) => (
                            <label key={tier.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={addOn.compatibleWith.includes(tier.id)}
                                onChange={() => handleToggleCompatibility(addOn.id, tier.id)}
                                className="w-4 h-4 text-primary-600 bg-white/5 border-white/20 rounded focus:ring-primary-500"
                              />
                              <span className="text-sm text-white">{tier.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

