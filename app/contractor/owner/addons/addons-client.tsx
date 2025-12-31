"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AddOn {
  id: string;
  name: string;
  category: "comfort" | "efficiency" | "air-quality" | "smart" | "warranty" | "other";
  totalPrice: number | null;
  description: string;
  educationalContent: string;
  compatibleWith: ("good" | "better" | "best")[];
  displayOrder: number;
  isActive: boolean;
}

interface Upgrade {
  id: string;
  name: string;
  fromTier: "good" | "better";
  toTier: "better" | "best";
  totalPrice: number | null;
  description: string;
  educationalContent: string;
  isActive: boolean;
}

interface AddOnsData {
  addOns: AddOn[];
  upgrades: Upgrade[];
}

export default function ContractorAddonsClient() {
  const [data, setData] = useState<AddOnsData>({
    addOns: [],
    upgrades: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  useEffect(() => {
    fetch("/api/contractor/addons")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (data.addOnsData) {
          setData(data.addOnsData);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load add-ons and upgrades");
        setLoading(false);
      });
  }, []);

  // Auto-save on field change (debounced)
  useEffect(() => {
    if (loading) return;
    
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleAutoSave = async () => {
    if (saving) return;
    
    setAutoSaveStatus("saving");
    setSaving(true);

    try {
      const response = await fetch("/api/contractor/addons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addOnsData: data }),
      });

      const result = await response.json();

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

  const handleAddOnChange = (addOnId: string, field: keyof AddOn, value: any) => {
    setData(prev => ({
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

  const handleUpgradeChange = (upgradeId: string, field: keyof Upgrade, value: any) => {
    setData(prev => ({
      ...prev,
      upgrades: prev.upgrades.map(upgrade =>
        upgrade.id === upgradeId
          ? { ...upgrade, [field]: value }
          : upgrade
      ),
    }));
    setAutoSaveStatus("unsaved");
    setError("");
  };

  const handleAddAddOn = () => {
    const newAddOn: AddOn = {
      id: `addon-${Date.now()}`,
      name: "",
      category: "comfort",
      totalPrice: null,
      description: "",
      educationalContent: "",
      compatibleWith: [],
      displayOrder: data.addOns.length,
      isActive: true,
    };
    setData(prev => ({
      ...prev,
      addOns: [...prev.addOns, newAddOn],
    }));
    setAutoSaveStatus("unsaved");
  };

  const handleAddUpgrade = () => {
    const newUpgrade: Upgrade = {
      id: `upgrade-${Date.now()}`,
      name: "",
      fromTier: "good",
      toTier: "better",
      totalPrice: null,
      description: "",
      educationalContent: "",
      isActive: true,
    };
    setData(prev => ({
      ...prev,
      upgrades: [...prev.upgrades, newUpgrade],
    }));
    setAutoSaveStatus("unsaved");
  };

  const handleRemoveAddOn = (addOnId: string) => {
    setData(prev => ({
      ...prev,
      addOns: prev.addOns.filter(addOn => addOn.id !== addOnId),
    }));
    setAutoSaveStatus("unsaved");
  };

  const handleRemoveUpgrade = (upgradeId: string) => {
    setData(prev => ({
      ...prev,
      upgrades: prev.upgrades.filter(upgrade => upgrade.id !== upgradeId),
    }));
    setAutoSaveStatus("unsaved");
  };

  const handleToggleCompatibility = (addOnId: string, tierId: "good" | "better" | "best") => {
    setData(prev => ({
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

  const parseCurrency = (value: string): number | null => {
    const cleaned = value.replace(/[^0-9]/g, "");
    return cleaned ? parseInt(cleaned, 10) : null;
  };

  const categoryOptions = [
    { value: "comfort", label: "Comfort" },
    { value: "efficiency", label: "Energy Efficiency" },
    { value: "air-quality", label: "Air Quality" },
    { value: "smart", label: "Smart Features" },
    { value: "warranty", label: "Warranty & Protection" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          Educational Add-Ons Configuration
        </h2>
        <p className="text-lg text-slate-300">
          Configure optional upgrades that educate homeowners about value. Build trust through education-first content, not sales pressure.
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
        <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Education-First Approach
        </h3>
        <p className="text-blue-200/80 text-sm leading-relaxed mb-2">
          Add-ons and upgrades are presented to homeowners through educational content, not sales pressure. 
          Each item includes educational content explaining benefits and value, helping homeowners make informed decisions.
        </p>
        <p className="text-blue-200/80 text-sm leading-relaxed">
          <strong>Compatibility enforcement:</strong> Add-ons only appear for tiers they're compatible with. 
          Upgrades show the path from one tier to the next. All pricing is flat-rate totals—no custom pricing per job.
        </p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4 text-slate-400">Loading configuration...</p>
        </div>
      )}

      {!loading && (
        <form onSubmit={handleManualSave} className="space-y-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg">
              Configuration saved successfully!
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

          {/* Add-Ons Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Add-Ons</h3>
                <p className="text-slate-400 text-sm">
                  Optional enhancements that can be added to any compatible tier. Homeowners see educational content explaining benefits.
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

            {data.addOns.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>No add-ons configured yet. Click "Add Add-On" to create one.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {data.addOns.map((addOn) => (
                  <div key={addOn.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addOn.isActive}
                            onChange={(e) => handleAddOnChange(addOn.id, "isActive", e.target.checked)}
                            className="w-4 h-4 text-primary-600 bg-white/5 border-white/20 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm font-semibold text-white">Active</span>
                        </label>
                      </div>
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
                      <div className="grid md:grid-cols-2 gap-4">
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
                            Category
                          </label>
                          <select
                            value={addOn.category}
                            onChange={(e) => handleAddOnChange(addOn.id, "category", e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            {categoryOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
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
                        <p className="text-xs text-slate-400 mt-1">
                          Flat-rate total price. No custom pricing per job.
                        </p>
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
                          placeholder="Brief description of what this add-on includes"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Educational Content
                        </label>
                        <textarea
                          value={addOn.educationalContent}
                          onChange={(e) => handleAddOnChange(addOn.id, "educationalContent", e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Explain the benefits and value in educational, non-salesy language. Help homeowners understand why they might want this add-on."
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          This content is shown to homeowners to help them make informed decisions. Focus on benefits and value, not sales pressure.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Compatible With Tiers
                        </label>
                        <p className="text-xs text-slate-400 mb-3">
                          Select which tiers this add-on can be added to. Compatibility is enforced—add-ons only appear for selected tiers.
                        </p>
                        <div className="flex gap-4">
                          {(["good", "better", "best"] as const).map((tierId) => (
                            <label key={tierId} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={addOn.compatibleWith.includes(tierId)}
                                onChange={() => handleToggleCompatibility(addOn.id, tierId)}
                                className="w-4 h-4 text-primary-600 bg-white/5 border-white/20 rounded focus:ring-primary-500"
                              />
                              <span className="text-sm text-white capitalize">{tierId}</span>
                            </label>
                          ))}
                        </div>
                        {addOn.compatibleWith.length === 0 && (
                          <p className="text-xs text-yellow-400 mt-2">
                            ⚠️ No tiers selected. This add-on won't appear to homeowners.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={addOn.displayOrder}
                          onChange={(e) => handleAddOnChange(addOn.id, "displayOrder", parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Lower numbers appear first. Use this to control the order add-ons are shown.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upgrades Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Tier Upgrades</h3>
                <p className="text-slate-400 text-sm">
                  Show homeowners the path from one tier to the next. Upgrades are educational opportunities, not sales pressure.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddUpgrade}
                className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all"
              >
                + Add Upgrade
              </button>
            </div>

            {data.upgrades.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>No upgrades configured yet. Click "Add Upgrade" to create one.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {data.upgrades.map((upgrade) => (
                  <div key={upgrade.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={upgrade.isActive}
                          onChange={(e) => handleUpgradeChange(upgrade.id, "isActive", e.target.checked)}
                          className="w-4 h-4 text-primary-600 bg-white/5 border-white/20 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-semibold text-white">Active</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveUpgrade(upgrade.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-white mb-2">
                            Upgrade Name
                          </label>
                          <input
                            type="text"
                            value={upgrade.name}
                            onChange={(e) => handleUpgradeChange(upgrade.id, "name", e.target.value)}
                            placeholder="e.g., Upgrade to Better, Upgrade to Best"
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                              From Tier
                            </label>
                            <select
                              value={upgrade.fromTier}
                              onChange={(e) => handleUpgradeChange(upgrade.id, "fromTier", e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="good">Good</option>
                              <option value="better">Better</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                              To Tier
                            </label>
                            <select
                              value={upgrade.toTier}
                              onChange={(e) => handleUpgradeChange(upgrade.id, "toTier", e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="better">Better</option>
                              <option value="best">Best</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Upgrade Price (Flat Rate)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                          <input
                            type="text"
                            value={upgrade.totalPrice !== null ? upgrade.totalPrice.toString() : ""}
                            onChange={(e) => {
                              const value = parseCurrency(e.target.value);
                              handleUpgradeChange(upgrade.id, "totalPrice", value);
                            }}
                            placeholder="0"
                            className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Additional cost to upgrade from the "From Tier" to the "To Tier". Flat-rate total only.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Description
                        </label>
                        <textarea
                          value={upgrade.description}
                          onChange={(e) => handleUpgradeChange(upgrade.id, "description", e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Brief description of what this upgrade includes"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Educational Content
                        </label>
                        <textarea
                          value={upgrade.educationalContent}
                          onChange={(e) => handleUpgradeChange(upgrade.id, "educationalContent", e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Explain the benefits of upgrading in educational, non-salesy language. Help homeowners understand the value of moving to the higher tier."
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          This content helps homeowners understand why they might want to upgrade. Focus on benefits and value, not sales pressure.
                        </p>
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

