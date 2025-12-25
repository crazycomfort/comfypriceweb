"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/analytics";
import PageLoader from "@/app/components/PageLoader";
import EstimateDisclaimer from "@/app/components/EstimateDisclaimer";

interface EstimateData {
  estimateId: string;
  costBreakdown: {
    equipment: number;
    labor: number;
    materials: number;
    total: number;
  };
  range: {
    min: number;
    max: number;
  };
  assumptions: string[];
}

interface OptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  recommended?: boolean;
  savings?: string;
  efficiency?: string;
}

function HomeownerH6Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [creatingShare, setCreatingShare] = useState(false);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [contactData, setContactData] = useState({
    name: "",
    phone: "",
    email: "",
    preferredContact: "email",
    timeline: "",
    financing: false,
    upgrades: [] as string[],
    notes: "",
    consentToContact: false,
  });
  const [submittingContact, setSubmittingContact] = useState(false);
  const estimateSharingEnabled = isFeatureEnabled("estimateSharing");

  useEffect(() => {
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError("Request timed out. Please try again.");
        setLoading(false);
      }
    }, 10000); // 10 second timeout
    
    const estimateId = searchParams.get("estimateId");
    
    if (estimateId) {
      fetch(`/api/homeowner/estimate/${estimateId}`)
        .then(async (res) => {
          // Read response body once (can only be read once)
          const text = await res.text();
          
          if (!text) {
            throw new Error(res.status === 404 
              ? "Estimate not found" 
              : `Server error: ${res.status} ${res.statusText}`);
          }
          
          let data;
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            throw new Error("Server error: Invalid JSON response. Please try again.");
          }
          
          if (!res.ok) {
            throw new Error(data.error || `Server error: ${res.status} ${res.statusText}`);
          }
          
          return data;
        })
        .then((data) => {
          if (data && data.estimate) {
            setEstimate(data.estimate);
          } else {
            setError(data?.error || "Estimate not found");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Estimate loading error:", err);
          setError(err.message || "Failed to load estimate. Please try again.");
          setLoading(false);
        })
        .finally(() => {
          clearTimeout(timeoutId);
        });
    } else {
      const formData = sessionStorage.getItem("homeownerEstimateInput");
      if (!formData) {
        setError("No estimate data found. Please start over.");
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      let inputData;
      try {
        inputData = JSON.parse(formData);
      } catch {
        setError("Invalid form data. Please start over.");
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      fetch("/api/homeowner/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      })
        .then(async (res) => {
          // Read response body once (can only be read once)
          const text = await res.text();
          
          if (!text) {
            throw new Error(res.ok 
              ? "Server error: Empty response. Please try again." 
              : `Server error: ${res.status} ${res.statusText}`);
          }
          
          let data;
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            throw new Error("Server error: Invalid JSON response. Please try again.");
          }
          
          if (!res.ok) {
            throw new Error(data.error || `Server error: ${res.status} ${res.statusText}`);
          }
          
          return data;
        })
            .then(async (data) => {
              if (data && data.estimate) {
                setEstimate(data.estimate);
                sessionStorage.setItem("homeownerEstimateId", data.estimate.estimateId);
                sessionStorage.removeItem("homeownerEstimateInput");
                
                // Track estimate generation (fail silently if it fails)
                try {
                  await fetch("/api/analytics/track", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      event: "estimate_generated",
                      properties: { estimateId: data.estimate.estimateId },
                    }),
                  });
                } catch (error) {
                  // Fail silently - analytics is not critical
                }
              } else {
                setError(data?.error || "Failed to generate estimate: Invalid response");
              }
              setLoading(false);
            })
        .catch((err) => {
          console.error("Estimate generation error:", err);
          setError(err.message || "Failed to generate estimate. Please try again.");
          setLoading(false);
        })
        .finally(() => {
          clearTimeout(timeoutId);
        });
    
    return () => {
      clearTimeout(timeoutId);
    };
    }
  }, [searchParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate option tiers with enhanced data
  const generateOptions = (): OptionTier[] => {
    if (!estimate) return [];
    
    const midPoint = (estimate.range.min + estimate.range.max) / 2;
    const range = estimate.range.max - estimate.range.min;
    
    return [
      {
        id: "good",
        name: "Good",
        description: "Reliable, efficient system that meets your basic needs",
        price: estimate.range.min,
        efficiency: "SEER 13-14",
        savings: "Standard efficiency",
        features: [
          "Standard efficiency equipment (SEER 13-14)",
          "Professional installation included",
          "Basic warranty coverage (1 year parts, 1 year labor)",
          "Quality components from trusted brands",
          "Standard thermostat included"
        ]
      },
      {
        id: "better",
        name: "Better",
        description: "Enhanced performance with modern features and improved efficiency",
        price: midPoint,
        efficiency: "SEER 15-16",
        savings: "Up to 25% energy savings",
        recommended: true,
        features: [
          "Higher efficiency rating (SEER 15-16)",
          "Advanced comfort features (variable speed)",
          "Extended warranty (5 years parts, 2 years labor)",
          "Energy-saving technology",
          "Programmable smart thermostat",
          "Quieter operation"
        ]
      },
      {
        id: "best",
        name: "Best",
        description: "Premium system with top-tier efficiency and smart home integration",
        price: estimate.range.max,
        efficiency: "SEER 17+",
        savings: "Up to 40% energy savings",
        features: [
          "Maximum efficiency rating (SEER 17+)",
          "Smart Wi-Fi thermostat included",
          "Premium warranty (10 years parts, 5 years labor)",
          "Advanced air quality features",
          "Zoning capabilities",
          "Ultra-quiet operation"
        ]
      }
    ];
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save estimate ID to localStorage for future reference
      if (estimate?.estimateId) {
        const savedEstimates = JSON.parse(localStorage.getItem("savedEstimates") || "[]");
        if (!savedEstimates.includes(estimate.estimateId)) {
          savedEstimates.push(estimate.estimateId);
          localStorage.setItem("savedEstimates", JSON.stringify(savedEstimates));
        }
      }
      setTimeout(() => {
        alert("Estimate saved! You can access it anytime from your browser's saved data.");
        setSaving(false);
      }, 300);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save estimate. Please try again.");
      setSaving(false);
    }
  };

  const handlePrint = async () => {
    // Track PDF export
    if (estimate?.estimateId) {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "estimate_pdf_exported",
            properties: { estimateId: estimate.estimateId },
          }),
        });
      } catch (error) {
        // Fail silently
      }
    }
    window.print();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setSendingEmail(true);

    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email address");
      setSendingEmail(false);
      return;
    }

    if (!estimate?.estimateId) {
      setEmailError("No estimate data available");
      setSendingEmail(false);
      return;
    }

    try {
      const response = await fetch("/api/estimate/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimateId: estimate.estimateId,
          email: email.trim(),
        }),
      });

      // Check if response has content before parsing
      const text = await response.text();
      if (!text) {
        throw new Error("Server error: Empty response. Please try again.");
      }
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error("Server error: Invalid response. Please try again.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      setEmailSent(true);
      setEmail("");
      
      // Track email sent
      if (estimate?.estimateId) {
        try {
          await fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "estimate_email_sent",
              properties: { estimateId: estimate.estimateId },
            }),
          });
        } catch (error) {
          // Fail silently
        }
      }
      
      setTimeout(() => {
        setShowEmailForm(false);
        setEmailSent(false);
      }, 3000);
    } catch (error) {
      setEmailError((error as Error).message || "Failed to send email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <PageLoader 
        message="Preparing your estimate..." 
        submessage="This will just take a moment"
      />
    );
  }

  if (error || !estimate) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-red-200 bg-red-50/30">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-semibold text-red-600">Unable to Load Estimate</h2>
            </div>
            <p className="text-base text-gray-700 mb-6">{error || "Failed to load estimate"}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/homeowner/h1" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
              >
                Start Over
              </Link>
              <Link 
                href="/" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const options = generateOptions();
  const priceRange = estimate.range.max - estimate.range.min;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Success Animation */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 opacity-20"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-in fade-in slide-in-from-top-4">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              Your HVAC Estimate is Ready
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 leading-relaxed">
              Transparent pricing tailored to your home. All-inclusive, no hidden fees.
            </p>
            
            {/* Price Range Display - Enhanced */}
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl mb-8 inline-block">
              <p className="text-sm text-primary-100 uppercase tracking-wider mb-3 font-semibold">
                Estimated Investment Range
              </p>
              <div className="text-5xl md:text-6xl font-bold mb-3">
                {formatCurrency(estimate.range.min)} - {formatCurrency(estimate.range.max)}
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-primary-100">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>All-inclusive pricing</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>No hidden fees</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Estimate
                  </>
                )}
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print / PDF
              </button>
              <button
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Estimate
              </button>
              {estimateSharingEnabled && estimate.estimateId && (
                <>
                  {shareToken ? (
                    <Link
                      href={`/estimate/${shareToken}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30 cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      View Share Link
                    </Link>
                  ) : (
                    <button
                      onClick={async () => {
                        setCreatingShare(true);
                        try {
                          const res = await fetch("/api/share/create", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              estimateId: estimate.estimateId,
                              expiresInHours: 168,
                              singleUse: false,
                              isHomeowner: true,
                            }),
                          });
                          // Check if response has content before parsing
                          const text = await res.text();
                          if (!text) {
                            alert("Server error: Empty response. Please try again.");
                            return;
                          }
                          let data;
                          try {
                            data = JSON.parse(text);
                          } catch (parseError) {
                            alert("Server error: Invalid response. Please try again.");
                            return;
                          }
                          if (data.token) {
                            setShareToken(data.token);
                            const shareUrl = `${window.location.origin}/estimate/${data.token}`;
                            navigator.clipboard.writeText(shareUrl);
                            alert("Share link created and copied to clipboard!");
                          } else {
                            alert(data.error || "Failed to create share link");
                          }
                        } catch (error) {
                          alert("Failed to create share link");
                        } finally {
                          setCreatingShare(false);
                        }
                      }}
                      disabled={creatingShare}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30 cursor-pointer disabled:opacity-50"
                    >
                      {creatingShare ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Create Share Link
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Email Form */}
            {showEmailForm && (
              <div className="mt-6 max-w-md mx-auto">
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                  {emailSent ? (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-white font-semibold mb-2">Email sent successfully!</p>
                      <p className="text-primary-100 text-sm">Check your inbox for your estimate.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError("");
                          }}
                          placeholder="your@email.com"
                          required
                          className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-900 placeholder:text-gray-400 border border-white/30 focus:ring-2 focus:ring-white focus:border-white transition-all"
                        />
                        {emailError && (
                          <p className="mt-2 text-sm text-red-200 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {emailError}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={sendingEmail}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {sendingEmail ? (
                            <>
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Send Estimate
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowEmailForm(false);
                            setEmail("");
                            setEmailError("");
                          }}
                          className="px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Price Comparison Visualization */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">Price Range Visualization</h3>
            <div className="relative h-8 bg-gradient-to-r from-primary-100 via-primary-300 to-primary-500 rounded-full overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-semibold text-white">
                <span>{formatCurrency(estimate.range.min)}</span>
                <span>{formatCurrency(estimate.range.max)}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <p className="text-xs text-gray-600">
                Range based on system efficiency and features • Your final price depends on specific equipment selected
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estimate Disclaimer */}
      <section className="py-6 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <EstimateDisclaimer />
        </div>
      </section>

      {/* Options Section - Enhanced */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your System
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Three carefully designed tiers to match your needs, budget, and efficiency goals. 
              Each option includes professional installation and quality equipment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {options.map((option, index) => (
              <div
                key={option.id}
                className={`bg-white rounded-2xl shadow-lg border-2 p-8 relative transition-all duration-300 ${
                  option.recommended
                    ? "border-primary-500 shadow-xl scale-105 z-10 ring-4 ring-primary-100"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-xl hover:scale-[1.02]"
                }`}
              >
                {option.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <span className="bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}
                
                {/* Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                    option.id === "good" ? "bg-gray-100" : 
                    option.id === "better" ? "bg-primary-100" : 
                    "bg-gradient-to-br from-primary-500 to-primary-600"
                  }`}>
                    <span className={`text-2xl font-bold ${
                      option.id === "best" ? "text-white" : "text-gray-700"
                    }`}>
                      {option.id === "good" ? "✓" : option.id === "better" ? "✓✓" : "✓✓✓"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{option.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{option.description}</p>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      {formatCurrency(option.price)}
                    </div>
                    {option.efficiency && (
                      <div className="text-sm font-medium text-primary-700 mb-2">
                        {option.efficiency}
                      </div>
                    )}
                    {option.savings && (
                      <div className="text-xs text-green-600 font-medium">
                        {option.savings}
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                    What's Included
                  </h4>
                  <ul className="space-y-3">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-700">
                        <svg
                          className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${
                            option.recommended ? "text-primary-700" : "text-gray-400"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button 
                  onClick={() => {
                    setSelectedTier(option.id);
                    setShowContactForm(true);
                    trackEvent("tier_selected", { tier: option.id, price: option.price });
                  }}
                  type="button"
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    option.recommended
                      ? "bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  } cursor-pointer`}
                >
                  {option.recommended ? "Get Started" : "Get Started"}
                </button>
              </div>
            ))}
          </div>

          {/* Comparison Note */}
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong className="text-gray-900">All options include:</strong> Professional installation, 
              quality equipment from trusted manufacturers, warranty coverage, and ongoing support. 
              The difference is in efficiency ratings, features, and long-term energy savings.
            </p>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-12 md:py-16 bg-white border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            What's Included in Every Estimate
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Professional Installation",
                description: "Licensed and insured technicians handle every aspect of installation with care and precision. All work is guaranteed."
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "Warranty Protection",
                description: "Comprehensive warranty coverage on equipment and labor. Terms vary by tier, with premium options offering extended protection."
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Energy Efficiency",
                description: "Modern systems designed to reduce your energy costs while keeping you comfortable year-round. Higher efficiency = lower bills."
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                title: "Ongoing Support",
                description: "Expert guidance and support throughout your project and beyond. We're here to help with maintenance and questions."
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assumptions Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Estimate Assumptions
              </h2>
            </div>
            <p className="text-base text-gray-600 mb-6 leading-relaxed">
              This estimate is based on the information you provided. Final pricing may vary based on:
            </p>
            <ul className="space-y-3">
              {estimate.assumptions.map((assumption, index) => (
                <li key={index} className="flex items-start text-base text-gray-700">
                  <svg
                    className="w-6 h-6 text-primary-700 mr-3 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span className="leading-relaxed">{assumption}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowContactForm(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h3 className="text-2xl font-bold text-gray-900">Get Started with Your Estimate</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmittingContact(true);
                try {
                  const response = await fetch("/api/homeowner/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...contactData,
                      estimateId: estimate?.estimateId,
                      selectedTier,
                      estimateRange: estimate?.range,
                      // Pull replacement reason data from sessionStorage
                      replacementReason: (() => {
                        if (typeof window !== 'undefined') {
                          const saved = sessionStorage.getItem("homeownerEstimateInput");
                          if (saved) {
                            const parsed = JSON.parse(saved);
                            return parsed.existingSystem?.replacementReason || "";
                          }
                        }
                        return "";
                      })(),
                      howTheyKnow: (() => {
                        if (typeof window !== 'undefined') {
                          const saved = sessionStorage.getItem("homeownerEstimateInput");
                          if (saved) {
                            const parsed = JSON.parse(saved);
                            return parsed.existingSystem?.howTheyKnow || [];
                          }
                        }
                        return [];
                      })(),
                      financing: (() => {
                        if (typeof window !== 'undefined') {
                          const saved = sessionStorage.getItem("homeownerEstimateInput");
                          if (saved) {
                            const parsed = JSON.parse(saved);
                            return parsed.preferences?.financingInterest || false;
                          }
                        }
                        return false;
                      })(),
                    }),
                  });
                  
                  // Check response before processing
                  const text = await response.text();
                  if (!text) {
                    if (!response.ok) {
                      alert("Server error: Empty response. Please try again.");
                    } else {
                      // Empty but OK response - treat as success
                      trackEvent("contact_form_submitted", { tier: selectedTier });
                      alert("Thank you! We'll contact you soon.");
                      setShowContactForm(false);
                      setContactData({
                        name: "",
                        phone: "",
                        email: "",
                        preferredContact: "email",
                        timeline: "",
                        financing: false,
                        upgrades: [],
                        notes: "",
                        consentToContact: false,
                      });
                    }
                    setSubmittingContact(false);
                    return;
                  }
                  
                  let data;
                  try {
                    data = JSON.parse(text);
                  } catch (parseError) {
                    if (response.ok) {
                      // Parse failed but response was OK - treat as success
                      trackEvent("contact_form_submitted", { tier: selectedTier });
                      alert("Thank you! We'll contact you soon.");
                      setShowContactForm(false);
                      setContactData({
                        name: "",
                        phone: "",
                        email: "",
                        preferredContact: "email",
                        timeline: "",
                        financing: false,
                        upgrades: [],
                        notes: "",
                        consentToContact: false,
                      });
                    } else {
                      alert("Server error: Invalid response. Please try again.");
                    }
                    setSubmittingContact(false);
                    return;
                  }
                  
                  if (response.ok) {
                    trackEvent("contact_form_submitted", { tier: selectedTier });
                    alert("Thank you! We'll contact you soon.");
                    setShowContactForm(false);
                    setContactData({
                      name: "",
                      phone: "",
                      email: "",
                      preferredContact: "email",
                      timeline: "",
                      financing: false,
                      upgrades: [],
                      notes: "",
                      consentToContact: false,
                    });
                  } else {
                    alert(data.error || "Failed to submit. Please try again.");
                  }
                } catch (error) {
                  alert("An error occurred. Please try again.");
                } finally {
                  setSubmittingContact(false);
                }
              }}
              className="p-6 space-y-6"
            >
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      required
                      value={contactData.name}
                      onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="contact-phone"
                      required
                      value={contactData.phone}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    required
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="preferred-contact" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <select
                    id="preferred-contact"
                    value={contactData.preferredContact}
                    onChange={(e) => setContactData({ ...contactData, preferredContact: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="text">Text Message</option>
                  </select>
                </div>
              </div>

              {/* Replacement Reason - Pull from Step 3 data */}
              {(() => {
                const savedData = typeof window !== 'undefined' ? sessionStorage.getItem("homeownerEstimateInput") : null;
                const parsed = savedData ? JSON.parse(savedData) : {};
                const replacementReason = parsed.existingSystem?.replacementReason || "";
                const howTheyKnow = parsed.existingSystem?.howTheyKnow || "";
                const hasHowTheyKnow = Array.isArray(howTheyKnow) 
                  ? howTheyKnow.length > 0 
                  : howTheyKnow !== "";
                
                if (replacementReason || hasHowTheyKnow) {
                  return (
                    <div className="space-y-4 border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-semibold text-gray-900">Replacement Information</h4>
                      {replacementReason && (
                        <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">Why you're replacing:</p>
                          <p className="text-sm text-gray-900">
                            {replacementReason === "proactive" && "Proactive - System is old but still working"}
                            {replacementReason === "broken" && "System is broken/not working"}
                            {replacementReason === "inefficient" && "System is inefficient/high energy bills"}
                            {replacementReason === "upgrade" && "Want to upgrade for better features"}
                            {replacementReason === "home-improvement" && "Part of home improvement project"}
                            {replacementReason === "other" && "Other reason"}
                          </p>
                        </div>
                      )}
                      {howTheyKnow && (Array.isArray(howTheyKnow) ? howTheyKnow.length > 0 : howTheyKnow) && (
                        <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-2">How you know it's time:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-900">
                            {(Array.isArray(howTheyKnow) ? howTheyKnow : [howTheyKnow]).map((reason: string) => (
                              <li key={reason}>
                                {reason === "age" && "System is 15+ years old"}
                                {reason === "repairs" && "Frequent repairs needed"}
                                {reason === "bills" && "High energy bills"}
                                {reason === "comfort" && "Home not comfortable"}
                                {reason === "noise" && "System is too noisy"}
                                {reason === "contractor" && "Contractor recommended replacement"}
                                {reason === "research" && "Research shows it's time"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              {/* Timeline */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900">Timeline</h4>
                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                    When are you looking to install? <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="timeline"
                    required
                    value={contactData.timeline}
                    onChange={(e) => setContactData({ ...contactData, timeline: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="">Select timeline...</option>
                    <option value="urgent">Urgent - Within 1 month</option>
                    <option value="soon">Soon - 1-3 months</option>
                    <option value="planning">Planning - 3-6 months</option>
                    <option value="future">Future - 6+ months</option>
                    <option value="exploring">Just exploring options</option>
                  </select>
                </div>
              </div>

              {/* Financing - Pull from Step 4 */}
              {(() => {
                const savedData = typeof window !== 'undefined' ? sessionStorage.getItem("homeownerEstimateInput") : null;
                const parsed = savedData ? JSON.parse(savedData) : {};
                const financingInterest = parsed.preferences?.financingInterest || false;
                
                if (financingInterest) {
                  return (
                    <div className="space-y-4 border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-semibold text-gray-900">Financing Interest</h4>
                      <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>You indicated interest in financing.</strong> Our team will contact you with personalized financing options including:
                        </p>
                        <ul className="list-disc list-inside space-y-1 mt-2 text-sm text-gray-700 ml-2">
                          <li>0% APR options for qualifying customers</li>
                          <li>Low monthly payment plans</li>
                          <li>Flexible terms from 12-120 months</li>
                          <li>Quick approval process</li>
                        </ul>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Upgrades */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900">Additional Services & Upgrades</h4>
                <p className="text-sm text-gray-600 mb-4">Select any additional services you're interested in:</p>
                <div className="space-y-3">
                  {[
                    { id: "air-purification", label: "Air Purification System", description: "Remove allergens, pollutants, and improve indoor air quality" },
                    { id: "duct-cleaning", label: "Duct Cleaning", description: "Professional cleaning of your existing ductwork" },
                    { id: "extended-warranty", label: "Extended Warranty", description: "Extended protection beyond standard warranty" },
                    { id: "smart-thermostat", label: "Smart Thermostat Upgrade", description: "Wi-Fi enabled thermostat for better control" },
                    { id: "zoning", label: "Zoning System", description: "Independent temperature control for different areas" },
                    { id: "maintenance-plan", label: "Maintenance Plan", description: "Regular maintenance and tune-ups" },
                  ].map((upgrade) => (
                    <label
                      key={upgrade.id}
                      className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={contactData.upgrades.includes(upgrade.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setContactData({ ...contactData, upgrades: [...contactData.upgrades, upgrade.id] });
                          } else {
                            setContactData({ ...contactData, upgrades: contactData.upgrades.filter(u => u !== upgrade.id) });
                          }
                        }}
                        className="mt-1 w-4 h-4 text-primary-700 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{upgrade.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{upgrade.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes or Questions
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={contactData.notes}
                  onChange={(e) => setContactData({ ...contactData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  placeholder="Tell us anything else we should know..."
                />
              </div>

              {/* Consent */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    id="consent-to-contact"
                    required
                    checked={contactData.consentToContact}
                    onChange={(e) => setContactData({ ...contactData, consentToContact: e.target.checked })}
                    className="mt-1 w-4 h-4 text-primary-700 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="consent-to-contact" className="text-sm font-medium text-gray-900 cursor-pointer">
                      I consent to be contacted by HVAC professionals <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      By checking this box, you agree to be contacted regarding your HVAC estimate. 
                      <strong className="text-gray-900"> We will not contact you without your consent.</strong> 
                      You can opt out at any time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingContact || !contactData.consentToContact}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {submittingContact ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Move Forward?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Schedule a consultation with a licensed HVAC professional to get a detailed quote 
              tailored to your specific needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button 
                onClick={() => {
                  setSelectedTier(null);
                  setShowContactForm(true);
                }}
                type="button"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg cursor-pointer"
              >
                Request Consultation
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <Link
                href="/education"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 text-lg cursor-pointer"
              >
                Learn More About HVAC
              </Link>
            </div>
            
            <div className="pt-8 border-t border-gray-700">
              <Link
                href="/homeowner/h5"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Previous Step
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function HomeownerH6() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading...</p>
        </div>
      </main>
    }>
      <HomeownerH6Content />
    </Suspense>
  );
}
