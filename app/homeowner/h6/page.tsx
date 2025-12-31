"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/analytics";
import PageLoader from "@/app/components/PageLoader";
import EstimateDisclaimer from "@/app/components/EstimateDisclaimer";
import {
  trackEstimateCompleted,
  trackComparisonView,
  trackFinancingView,
  trackResultsPageLoad,
  trackResultsPageTime,
  trackSave,
  trackShare,
  trackTierSelection,
  trackScrollDepth,
  trackNextStepsView,
  meetsMinimumEngagementThreshold,
  getLeadSignalsForEstimate,
} from "@/lib/lead-qualification";

interface EstimateData {
  estimateId: string;
  tierRanges: {
    good: { min: number; max: number };
    better: { min: number; max: number };
    best: { min: number; max: number };
  };
  regionalBand?: {
    band: "low" | "average" | "high";
    label: string;
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
  const [selectedTierForComparison, setSelectedTierForComparison] = useState<string | null>(null);
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
  const [showMonthlyEstimates, setShowMonthlyEstimates] = useState(false);
  const estimateSharingEnabled = isFeatureEnabled("estimateSharing");
  const [meetsEngagementThreshold, setMeetsEngagementThreshold] = useState(false);
  const [readinessCheckMessage, setReadinessCheckMessage] = useState<string | null>(null);
  
  // Primary tier selection for recommendation display - default to "Better"
  // This controls which tier is shown as the dominant recommendation
  const [primaryTier, setPrimaryTier] = useState<"good" | "better" | "best">("better");
  
  // Collapsible education sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "how-pricing-estimated": false,
    "what-drives-price": false,
    "options-comparison": false,
    "ways-to-reduce": false,
    "financing": false,
  });
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Get price range for selected primary tier
  const getPrimaryTierRange = () => {
    if (!estimate) return null;
    return estimate.tierRanges[primaryTier];
  };
  
  // Helper function to handle appointment request with engagement threshold check
  const handleAppointmentRequest = () => {
    if (!estimate?.estimateId) {
      setShowContactForm(true);
      return;
    }
    
    const signals = getLeadSignalsForEstimate(estimate.estimateId);
    const meetsThreshold = meetsMinimumEngagementThreshold(signals);
    
    if (!meetsThreshold) {
      // Guide back to education/comparison, don't block
      setReadinessCheckMessage("Most homeowners review their options and comparison before requesting an on-site evaluation. You can still request one anytime.");
      // Scroll to comparison section to help them engage more
      const comparisonSection = document.getElementById("options-comparison") || 
                               document.querySelector('[data-section="options-comparison"]');
      if (comparisonSection) {
        comparisonSection.scrollIntoView({ behavior: "smooth", block: "start" });
        // Expand comparison section if collapsed
        setExpandedSections(prev => ({ ...prev, "options-comparison": true }));
      }
      return;
    }
    
    // Threshold met, proceed to appointment request
    setShowContactForm(true);
  };

  // Get tier label
  const getTierLabel = (tier: "good" | "better" | "best") => {
    const labels = {
      good: "Good",
      better: "Better",
      best: "Best"
    };
    return labels[tier];
  };
  
  // Get tier recommendation text
  const getTierRecommendationText = (tier: "good" | "better" | "best") => {
    const texts = {
      good: "Most affordable option for basic comfort needs",
      better: "Recommended for most homes like yours",
      best: "Maximum efficiency and long-term value"
    };
    return texts[tier];
  };

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
            const loadStartTime = performance.now();
            setEstimate(data.estimate);
            
            // Track estimate completion and page load time
            const loadTime = performance.now() - loadStartTime;
            try {
              trackEstimateCompleted(data.estimate.estimateId);
              trackResultsPageLoad(data.estimate.estimateId, loadTime);
            } catch (error) {
              // Fail silently - tracking should never break the app
            }
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

      // Validate input data before sending
      if (!inputData || typeof inputData !== "object") {
        setError("Invalid form data. Please start over.");
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      // Check if inputData is empty or missing required fields
      if (Object.keys(inputData).length === 0) {
        setError("No form data found. Please start over from the beginning.");
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      // Validate required fields exist
      if (!inputData.zipCode || !inputData.squareFootage || !inputData.floors || !inputData.homeAge) {
        setError("Missing required form data. Please start over from the beginning.");
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      if (!inputData.preferences?.efficiencyLevel || !inputData.preferences?.systemType) {
        setError("Missing preference data. Please go back and complete Step 4.");
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      // Log input data for debugging (in development)
      if (process.env.NODE_ENV === "development") {
        console.log("Sending estimate request with data:", inputData);
      }

      const requestBody = JSON.stringify(inputData);
      
      console.log('[CLIENT DEBUG] About to fetch /api/homeowner/estimate with body:', inputData);
      
      fetch("/api/homeowner/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      })
        .then(async (res) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h6/page.tsx:153',message:'Response received',data:{status:res.status,statusText:res.statusText,ok:res.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D,E'})}).catch(()=>{});
          // #endregion
          console.log('[CLIENT DEBUG] Response received:', { status: res.status, statusText: res.statusText, ok: res.ok });
          
          // Read response body once (can only be read once)
          let text: string;
          try {
            text = await res.text();
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h6/page.tsx:157',message:'Response text read',data:{textLength:text?.length,textPreview:text?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
          } catch (readError) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h6/page.tsx:159',message:'Failed to read response',data:{error:String(readError)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            console.error("Failed to read response:", readError);
            throw new Error("Failed to read server response. Please try again.");
          }
          
          if (!text || text.trim() === "") {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h6/page.tsx:163',message:'Empty response',data:{status:res.status,statusText:res.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            const errorMsg = res.ok 
              ? "Server error: Empty response. Please try again." 
              : `Server error: ${res.status} ${res.statusText}`;
            console.error("Empty response from API:", { status: res.status, statusText: res.statusText });
            throw new Error(errorMsg);
          }
          
          let data: any;
          try {
            data = JSON.parse(text);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h6/page.tsx:173',message:'Response parsed',data:{hasError:!!data.error,hasEstimate:!!data.estimate,validationErrors:data.validationErrors},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
          } catch (parseError) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h6/page.tsx:175',message:'Parse error',data:{error:String(parseError),textPreview:text.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            console.error("Failed to parse API response:", parseError, "Response text:", text.substring(0, 200));
            throw new Error("Server error: Invalid response format. Please try again.");
          }
          
          if (!res.ok) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h6/page.tsx:179',message:'API error response',data:{status:res.status,hasData:!!data,dataKeys:data?Object.keys(data):[],error:data?.error,details:data?.details},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
            // #endregion
            
            // Extract error message from response
            let errorMsg = "An error occurred while generating your estimate.";
            if (data && typeof data === 'object') {
              if (data.error && typeof data.error === 'string') {
                errorMsg = data.error;
              } else if (data.details && typeof data.details === 'string') {
                errorMsg = data.details;
              } else if (data.validationErrors && Array.isArray(data.validationErrors) && data.validationErrors.length > 0) {
                errorMsg = `Please complete all required fields: ${data.validationErrors.join(", ")}`;
              } else {
                errorMsg = `Server error: ${res.status} ${res.statusText || 'Unknown error'}`;
              }
            } else {
              errorMsg = `Server error: ${res.status} ${res.statusText || 'Unknown error'}. Please try again.`;
            }
            
            // Only log if we have meaningful data
            if (data && typeof data === 'object' && Object.keys(data).length > 0) {
              console.error('[CLIENT DEBUG] API error response:', { 
                status: res.status, 
                statusText: res.statusText,
                error: data.error,
                details: data.details,
                validationErrors: data.validationErrors 
              });
            } else {
              console.error('[CLIENT DEBUG] API error response (no error details):', { 
                status: res.status, 
                statusText: res.statusText,
                responseText: text?.substring(0, 200) || 'Empty response'
              });
            }
            
            throw new Error(errorMsg);
          }
          
          // Validate response structure
          if (!data || typeof data !== "object") {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h6/page.tsx:196',message:'Invalid response structure',data:{data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            throw new Error("Invalid response from server. Please try again.");
          }
          
          if (!data.estimate || typeof data.estimate !== "object") {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h6/page.tsx:200',message:'Missing estimate in response',data:{data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            throw new Error("Estimate data is missing from response. Please try again.");
          }
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h6/page.tsx:204',message:'Response validated successfully',data:{hasEstimate:!!data.estimate,estimateId:data.estimate?.estimateId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          
          return data;
        })
        .then(async (data) => {
          if (data && data.estimate) {
            const loadStartTime = performance.now();
            setEstimate(data.estimate);
            sessionStorage.setItem("homeownerEstimateId", data.estimate.estimateId);
            sessionStorage.removeItem("homeownerEstimateInput");
            
            // Track estimate completion and page load time
            const loadTime = performance.now() - loadStartTime;
            try {
              trackEstimateCompleted(data.estimate.estimateId);
              trackResultsPageLoad(data.estimate.estimateId, loadTime);
            } catch (error) {
              // Fail silently - tracking should never break the app
            }
            
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
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h6/page.tsx:232',message:'Fetch error caught',data:{error:String(err),message:err.message,stack:err.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
          // #endregion
          console.error('[CLIENT DEBUG] Estimate generation error:', err);
          console.error('[CLIENT DEBUG] Error details:', { message: err.message, stack: err.stack, name: err.name });
          const errorMessage = err.message || "Failed to generate estimate. Please try again.";
          setError(errorMessage);
          setLoading(false);
          
          // If it's a validation error, suggest going back
          if (errorMessage.includes("required") || errorMessage.includes("complete")) {
            setError(`${errorMessage}\n\nPlease go back and complete all required fields.`);
          }
        })
        .finally(() => {
          clearTimeout(timeoutId);
        });
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchParams]);

  // Track time spent on results page
  useEffect(() => {
    if (!estimate?.estimateId) return;
    
    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      if (timeSpent > 0 && timeSpent % 10 === 0) {
        // Update every 10 seconds
        try {
          trackResultsPageTime(estimate.estimateId, timeSpent);
        } catch (error) {
          // Fail silently - tracking should never break the app
        }
      }
    }, 10000); // Check every 10 seconds
    
    // Track on unmount
    return () => {
      const finalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
      if (finalTimeSpent > 0) {
        try {
          trackResultsPageTime(estimate.estimateId, finalTimeSpent);
        } catch (error) {
          // Fail silently - tracking should never break the app
        }
      }
      clearInterval(intervalId);
    };
  }, [estimate?.estimateId]);

  // Track scroll depth and next steps section view
  useEffect(() => {
    if (!estimate?.estimateId) return;
    
    let lastScrollDepth = 0;
    
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // Calculate scroll depth as percentage
      const scrollDepth = Math.min(100, Math.round((scrollTop / (documentHeight - windowHeight)) * 100));
      
      // Only update if depth increased (don't overwrite with lower values)
      if (scrollDepth > lastScrollDepth) {
        lastScrollDepth = scrollDepth;
        try {
          trackScrollDepth(estimate.estimateId, scrollDepth);
        } catch (error) {
          // Fail silently - tracking should never break the app
        }
      }
    };
    
    // Track next steps section view using IntersectionObserver
    const nextStepsSection = document.getElementById("next-steps-section") || 
                             document.querySelector('[data-section="next-steps"]');
    
    if (nextStepsSection) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              try {
                trackNextStepsView(estimate.estimateId);
              } catch (error) {
                // Fail silently - tracking should never break the app
              }
              observer.disconnect(); // Only track once
            }
          });
        },
        { threshold: 0.3 }
      );
      
      observer.observe(nextStepsSection);
      
      return () => {
        window.removeEventListener("scroll", handleScroll);
        observer.disconnect();
      };
    }
    
    // Track scroll depth
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [estimate?.estimateId]);

  // Track comparison section view using IntersectionObserver
  useEffect(() => {
    if (!estimate?.estimateId) return;
    
    const comparisonSection = document.getElementById("comparison-section");
    if (!comparisonSection) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            try {
              trackComparisonView(estimate.estimateId);
            } catch (error) {
              // Fail silently - tracking should never break the app
            }
            observer.disconnect(); // Only track once
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% visible
    );
    
    observer.observe(comparisonSection);
    
    return () => {
      observer.disconnect();
    };
  }, [estimate?.estimateId]);

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
    
    return [
      {
        id: "good",
        name: "Good",
        description: "Reliable, efficient system that meets your basic needs",
        price: estimate.tierRanges.good.min,
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
        price: estimate.tierRanges.better.min,
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
        price: estimate.tierRanges.best.min,
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
        
        // Track save action
        try {
          trackSave(estimate.estimateId);
        } catch (error) {
          // Fail silently - tracking should never break the app
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
    <main id="main-content" className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
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
  // Generate pricing factors for "Why this price is normal" section
  const generatePricingFactors = () => {
    if (!estimate) return [];
    
    // Get input data from sessionStorage
    let inputData: any = null;
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem("homeownerEstimateInput");
      if (saved) {
        try {
          inputData = JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing saved input:", e);
        }
      }
    }
    
    if (!inputData) return [];
    
    const factors = [];
    const sqft = inputData.squareFootage || 0;
    const efficiency = inputData.preferences?.efficiencyLevel || "basic";
    const systemType = inputData.preferences?.systemType || "central-air";
    const minPrice = estimate.tierRanges.good.min;
    const maxPrice = estimate.tierRanges.best.max;
    const midPrice = Math.round((minPrice + maxPrice) / 2);

    // Factor 1: Home size
    if (sqft > 0) {
      factors.push({
        title: `Homes like yours (${sqft.toLocaleString()} sqft) typically see installations in the range of ${formatCurrency(minPrice)}–${formatCurrency(maxPrice)}`,
        explanation: `Most professionally installed systems in this size range include complete system replacement, updated ductwork connections, and professional installation. This range reflects what licensed contractors typically quote for homes this size.`
      });
    }

    // Factor 2: System type
    if (systemType) {
      const systemName = systemType === "heat-pump" ? "heat pump systems" : 
                        systemType === "dual-fuel" ? "dual-fuel systems" : 
                        "central air systems";
      factors.push({
        title: `${systemName.charAt(0).toUpperCase() + systemName.slice(1)} in your area typically range ${formatCurrency(minPrice)}–${formatCurrency(maxPrice)}`,
        explanation: `Most professionally installed systems in this range include the equipment, professional installation, and all necessary connections. This range reflects common installation scenarios that licensed contractors encounter.`
      });
    }

    // Factor 3: Efficiency level
    if (efficiency) {
      const efficiencyName = efficiency === "premium" ? "higher efficiency" : 
                             efficiency === "standard" ? "standard efficiency" : 
                             "basic efficiency";
      factors.push({
        title: `${efficiencyName.charAt(0).toUpperCase() + efficiencyName.slice(1)} systems typically range ${formatCurrency(midPrice)}–${formatCurrency(maxPrice)}`,
        explanation: `This range reflects typical installations for ${efficiencyName} systems. ${efficiency === "premium" ? "Premium systems cost more upfront but reduce energy bills over time." : efficiency === "standard" ? "Standard efficiency balances upfront cost and long-term savings." : "Basic systems have lower upfront costs with higher long-term energy expenses."}`
      });
    }

    // Factor 4: Regional pricing
    if (inputData.zipCode) {
      factors.push({
        title: `Regional pricing for your area (ZIP ${inputData.zipCode}) reflects local labor and material costs`,
        explanation: `Installation costs vary by region. Your estimate reflects typical pricing in your area based on common installation scenarios. This range aligns with what licensed contractors typically quote after evaluation.`
      });
    }

    // Factor 5: What's included
    factors.push({
      title: `Most installations in this range include complete system replacement and professional installation`,
      explanation: `This estimate covers equipment, installation, necessary permits, and standard warranty. Prices below this range usually exclude one or more of these essential components.`
    });

    return factors.slice(0, 5); // Return up to 5 factors
  };

  const pricingFactors = generatePricingFactors();

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Success Animation */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 opacity-20"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* ONE DOMINANT HEADLINE */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Your HVAC Investment Range
            </h1>
            
            {/* PRICE ANCHOR - Industry-grounded context before pricing */}
            <p className="text-base md:text-lg text-primary-100/90 mb-8 leading-relaxed max-w-2xl mx-auto">
              Most professionally installed systems for homes like yours fall within this range
            </p>
            
            {/* PRIMARY RECOMMENDATION CARD - Single dominant price range, stable layout */}
            <div className="max-w-4xl mx-auto mb-16">
              {/* Tier Selector - Horizontal segmented control, no layout shifts */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
                  {(["good", "better", "best"] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setPrimaryTier(tier)}
                      className={`px-6 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                        primaryTier === tier
                          ? "bg-white text-primary-700 shadow-md"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      }`}
                      aria-pressed={primaryTier === tier}
                    >
                      {getTierLabel(tier)}
                    </button>
                  ))}
                </div>
              </div>

              {/* PRICE PRESENTATION = CEREMONY - Serious, Considered, Respectful */}
              <div className="bg-white/20 backdrop-blur-xl rounded-3xl border-3 border-white/40 shadow-2xl p-12 md:p-16" style={{ minHeight: '320px' }}>
                {/* Subtle divider above price */}
                <div className="text-center mb-8">
                  <p className="text-sm text-primary-100/80 uppercase tracking-widest mb-6" style={{ fontWeight: 500, letterSpacing: '0.1em' }}>
                    {getTierRecommendationText(primaryTier)}
                  </p>
                  
                  {/* LARGE PRICE RANGE - Ceremonial presentation */}
                  {getPrimaryTierRange() && (
                    <div className="py-8">
                      <div 
                        className="text-white mb-4"
                        style={{ 
                          fontFamily: 'var(--font-display)',
                          fontSize: 'clamp(3rem, 6vw, 5rem)', // Larger: 48px → 80px
                          lineHeight: 1.1,
                          fontWeight: 500,
                          letterSpacing: '-0.02em'
                        }}
                      >
                        {formatCurrency(getPrimaryTierRange()!.min)} - {formatCurrency(getPrimaryTierRange()!.max)}
                      </div>
                    </div>
                  )}
                  
                  {/* Subtle divider below price */}
                  <div className="border-t border-white/20 pt-6 mt-6">
                    <p className="text-sm text-primary-100/70 mb-2">
                      Reflects common installation scenarios
                    </p>
                    <p className="text-xs text-primary-100/60">
                      This range aligns with what licensed contractors typically quote after evaluation
                    </p>
                  </div>
                </div>
              </div>

              {/* Secondary Comparison Toggle - Muted, non-dominant */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, "options-comparison": !prev["options-comparison"] }))}
                  className="text-meta text-primary-100/80 hover:text-primary-100 transition-colors inline-flex items-center gap-2"
                >
                  <span>Compare all options</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${expandedSections["options-comparison"] ? "rotate-180" : ""}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* SEPARATE PRICE FROM ACTION - Vertical spacing reinforces decision-making */}
            <div className="mt-16 mb-8"></div>
            
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
                            
                            // Track share action
                            if (estimate?.estimateId) {
                              try {
                                trackShare(estimate.estimateId);
                              } catch (error) {
                                // Fail silently - tracking should never break the app
                              }
                            }
                            
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

      {/* SECONDARY COMPARISON AREA - Expandable, non-dominant */}
      {expandedSections["options-comparison"] && (
        <section className="py-8 md:py-12 bg-white/50 border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-section text-gray-900 mb-3">All Options at a Glance</h2>
              <p className="text-body text-gray-600">Compare Good, Better, and Best side by side</p>
            </div>
            
            {/* PRICE ANCHOR - Context before comparison */}
            <p className="text-center text-sm text-gray-600 mb-6 max-w-2xl mx-auto">
              These ranges reflect typical installations for homes like yours. Most installations land in the middle of each range.
            </p>
            
            {/* Compact comparison grid - Muted, secondary */}
            <div className="grid md:grid-cols-3 gap-4">
              {(["good", "better", "best"] as const).map((tier) => {
                const range = estimate.tierRanges[tier];
                const isSelected = primaryTier === tier;
                const midPoint = Math.round((range.min + range.max) / 2);
                return (
                  <div
                    key={tier}
                    className={`bg-white rounded-xl border-2 p-6 transition-all ${
                      isSelected
                        ? "border-primary-300 shadow-md"
                        : "border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="text-center">
                      <p className="text-meta text-gray-500 mb-2 uppercase tracking-wide">{getTierLabel(tier)}</p>
                      <div className="text-2xl font-medium text-gray-900 mb-1">
                        {formatCurrency(range.min)} - {formatCurrency(range.max)}
                      </div>
                      {/* Typical install indicator - non-interactive */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Typical installs land here</p>
                        <p className="text-sm font-medium text-gray-700 mt-1">{formatCurrency(midPoint)}</p>
                      </div>
                      {isSelected && (
                        <span className="inline-block mt-3 px-3 py-1 bg-primary-100 text-primary-700 text-meta-small rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* EDUCATION SECTIONS - Grouped and Collapsible */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Subtle section separator */}
          <div className="border-t border-gray-100 mb-12"></div>
          
          {/* Education Header */}
          <div className="text-center mb-10">
            <h2 className="text-section text-gray-900 mb-3">
              Understanding Your Estimate
            </h2>
            <p className="text-body text-gray-600 max-w-2xl mx-auto">
              Expand any section below to learn more about how this range reflects typical installations and what it means for your home.
            </p>
          </div>

          {/* Collapsible Education Sections */}
          <div className="space-y-4">
            {/* How Pricing is Estimated - Collapsible */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("how-pricing-estimated")}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                    How Pricing is Estimated
                  </h3>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections["how-pricing-estimated"] ? "rotate-180" : ""}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSections["how-pricing-estimated"] && (
                <div className="px-6 pb-6">
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <p className="text-base text-gray-700 leading-relaxed mb-4">
                          The pricing ranges you see reflect common installation scenarios for homes similar to yours. 
                          These ranges align with typical installations that licensed contractors complete, not exact prices for your specific situation.
                        </p>
                        <p className="text-base text-gray-700 leading-relaxed">
                          Several key variables influence where your installation falls within this range:
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <h4 className="text-base font-semibold text-gray-900 mb-4">Key Variables</h4>
                        <ul className="space-y-3">
                          <li>
                            <p className="font-medium text-gray-900 mb-1">Home Size</p>
                            <p className="text-sm text-gray-600">
                              Larger homes typically need more powerful systems and more installation work. 
                              Your home's square footage helps determine the system capacity required.
                            </p>
                          </li>
                          <li>
                            <p className="font-medium text-gray-900 mb-1">Equipment Tier</p>
                            <p className="text-sm text-gray-600">
                              The efficiency level and features you choose (Good, Better, or Best) affect the upfront cost. 
                              Higher efficiency systems typically cost more but can save on energy bills over time.
                            </p>
                          </li>
                          <li>
                            <p className="font-medium text-gray-900 mb-1">Installation Complexity</p>
                            <p className="text-sm text-gray-600">
                              Factors like your home's age, existing ductwork condition, access to installation areas, 
                              and local code requirements can affect how straightforward or complex the installation will be.
                            </p>
                          </li>
                          {estimate?.regionalBand && (
                            <li>
                              <p className="font-medium text-gray-900 mb-1">Regional Factors</p>
                              <p className="text-sm text-gray-600">
                                Labor rates, material costs, and permit requirements vary by location. 
                                Your ZIP code helps us adjust the range to reflect typical costs in your area ({estimate.regionalBand.label}).
                              </p>
                            </li>
                          )}
                        </ul>
                      </div>

                      <EstimateDisclaimer className="mt-4" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* What Drives the Price Range - Collapsible - NO DECORATIVE ICON */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("what-drives-price")}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-100/50 transition-colors text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  What Drives the Price Range
                </h3>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections["what-drives-price"] ? "rotate-180" : ""}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSections["what-drives-price"] && (
                <div className="px-6 pb-6">
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <ul className="space-y-3">
                      <li>
                        <p className="text-sm text-gray-700"><strong className="text-gray-900 font-semibold">Efficiency level:</strong> Higher efficiency systems cost more upfront but reduce long-term operating costs.</p>
                      </li>
                      <li>
                        <p className="text-sm text-gray-700"><strong className="text-gray-900 font-semibold">Optional upgrades:</strong> Smart thermostats, zoning systems, and air quality features can move pricing within the range.</p>
                      </li>
                      <li>
                        <p className="text-sm text-gray-700"><strong className="text-gray-900 font-semibold">Home size and layout:</strong> Larger homes and multi-story layouts typically require more capacity and installation complexity.</p>
                      </li>
                      <li>
                        <p className="text-sm text-gray-700"><strong className="text-gray-900 font-semibold">Installation conditions:</strong> Access difficulty, existing infrastructure condition, and code requirements affect installation scope.</p>
                      </li>
                      {(() => {
                        if (typeof window !== 'undefined') {
                          const saved = sessionStorage.getItem("homeownerEstimateInput");
                          if (saved) {
                            try {
                              const parsed = JSON.parse(saved);
                              if (parsed.installationFactors?.permits === "yes") {
                                return (
                                  <li>
                                    <p className="text-sm text-gray-700"><strong className="text-gray-900 font-semibold">Scheduling and permits:</strong> Permit requirements and installation timeline can influence total cost.</p>
                                  </li>
                                );
                              }
                            } catch (e) {
                              // Ignore parse errors
                            }
                          }
                        }
                        return null;
                      })()}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Ways to Reduce Cost - Collapsible - NO DECORATIVE ICON */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("ways-to-reduce")}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-100/50 transition-colors text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  Ways to Reduce the Total
                </h3>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections["ways-to-reduce"] ? "rotate-180" : ""}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSections["ways-to-reduce"] && (
                <div className="px-6 pb-6">
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-6 text-center">
                      These are common options homeowners consider. Nothing is locked in.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-base font-semibold text-gray-900 mb-2">Choose a lower option tier</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Standard efficiency systems meet basic comfort needs and typically cost less upfront.
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-base font-semibold text-gray-900 mb-2">Defer non-essential upgrades</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Features like smart thermostats or zoning systems can be added later.
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-base font-semibold text-gray-900 mb-2">Adjust timing or scope</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Planning ahead allows for better scheduling and pricing.
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-base font-semibold text-gray-900 mb-2">Ask about incentives or rebates</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Utility companies and manufacturers sometimes offer rebates for energy-efficient systems.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* WHY THIS ESTIMATE IS RELIABLE - Methodology focus, not brand bragging */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Subtle section separator */}
          <div className="border-t border-gray-200 mb-10"></div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-section text-gray-900 mb-3">
              Why this estimate is reliable
            </h2>
            <p className="text-body text-gray-600 max-w-2xl mx-auto">
              Understanding how this estimate is built helps you use it with confidence.
            </p>
          </div>

            {/* Methodology - Cleaner, fewer cards, no decorative icons */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Based on typical installations
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ranges reflect common scenarios from typical HVAC installations, not theoretical calculations.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Regional factors considered
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your location helps adjust ranges for typical labor rates, material costs, and local requirements in your area.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Clear assumptions
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                What this estimate does and does not assume is explained upfront, so you know its limitations.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* PERSISTENT CTA - Not Dominant, Always Visible */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-gray-600">
                When you're ready for professional review, we can help connect you with a licensed contractor.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedTierForComparison(null);
                  setShowContactForm(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                type="button"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                Request Professional Review
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed CTA */}
      <div className="h-20"></div>

      {/* OLD Ways to Reduce Cost Section - REMOVE */}
      <section id="ways-to-reduce" className="py-12 md:py-16 bg-gray-50 border-b border-gray-200 hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Ways to reduce the total
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These are common options homeowners consider. Nothing is locked in.
            </p>
          </div>

          {/* Cost-Reduction Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Card 1: Choose a lower option tier */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Choose a lower option tier
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Standard efficiency systems meet basic comfort needs and typically cost less upfront. Many homeowners find this option sufficient for their home and budget.
              </p>
            </div>

            {/* Card 2: Defer non-essential upgrades */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Defer non-essential upgrades
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Features like smart thermostats, zoning systems, or air quality enhancements can be added later. Focus on the core system first if budget is a concern.
              </p>
            </div>

            {/* Card 3: Adjust timing or scope */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Adjust timing or scope
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Planning ahead allows for better scheduling and pricing. Some homeowners phase installation or prioritize certain areas of the home first.
              </p>
            </div>

            {/* Card 4: Maintenance plan vs upfront add-ons */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Maintenance plan vs upfront add-ons
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Consider whether extended warranties or service plans are needed immediately. These can often be added later if desired.
              </p>
            </div>

            {/* Card 5: Ask about incentives or rebates */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Ask about incentives or rebates
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Utility companies and manufacturers sometimes offer rebates or incentives for energy-efficient systems. Availability varies by location and timing. A professional can help identify what's available in your area.
              </p>
            </div>
          </div>

          {/* Reassurance Copy */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <p className="text-base text-gray-700 leading-relaxed text-center">
              You don't need to decide everything today. Many homeowners review these options with a professional before moving forward.
            </p>
            <p className="text-sm text-gray-500 text-center mt-3">
              This is just information. You're not committing to anything.
            </p>
          </div>

          {/* ONE PRIMARY CTA - Clean, human language */}
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => {
                setSelectedTierForComparison(null);
                handleAppointmentRequest();
              }}
              type="button"
              className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-200 shadow-lg text-lg cursor-pointer"
            >
              Request on-site evaluation
            </button>
          </div>
          
          {/* Secondary action - Visually lighter */}
          <div className="mt-6 flex justify-center">
            <Link
              href="/why-different"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline-offset-4 hover:underline"
            >
              Why this estimate is different
            </Link>
          </div>
        </div>
      </section>

      {/* OLD Confidence Builders Section - REMOVED (moved above after education) */}
      <section className="py-12 md:py-16 bg-white border-b border-gray-200 hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Why homeowners choose us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A few things that matter when you're making a big decision.
            </p>
          </div>

          {/* Confidence Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Licensed & Insured */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Licensed & insured
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                All work is performed by licensed professionals with full insurance coverage for your protection.
              </p>
            </div>

            {/* Clear warranties */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Clear warranties
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Warranty terms are explained upfront so you know exactly what's covered and for how long.
              </p>
            </div>

            {/* Proven experience */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Proven experience
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Experienced technicians who understand local building codes and installation best practices.
              </p>
            </div>

            {/* Transparent pricing */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Transparent pricing
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Estimates show realistic ranges upfront for planning purposes.
              </p>
            </div>

            {/* Ongoing support */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ongoing support
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Help is available after installation for questions, maintenance, and warranty support.
              </p>
            </div>

            {/* Local presence */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Local presence
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Familiar with regional requirements, local codes, and typical installation challenges in your area.
              </p>
            </div>
          </div>

          {/* Optional Social Proof */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-8">
            <p className="text-base text-gray-700 leading-relaxed text-center italic">
              "The estimate was straightforward and the installation team was professional. No surprises, which is what we wanted."
            </p>
            <p className="text-sm text-gray-600 text-center mt-3">
              — Homeowner, recent installation
            </p>
          </div>

          {/* Reassurance Copy */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <p className="text-base text-gray-700 leading-relaxed text-center">
              Requesting an appointment doesn't lock you into anything. It's just the next step to get answers.
            </p>
            <p className="text-sm text-gray-500 text-center mt-3">
              This is informational. No sales pressure.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center font-medium">
                No calls required. You decide when to talk to someone.
              </p>
            </div>
          </div>

          {/* Intent Framing */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 text-center">
              Most homeowners here are actively planning a replacement.
            </p>
          </div>

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleAppointmentRequest}
                type="button"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
              >
                Request appointment
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
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
                  Save and return
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Save, Return, and Share Section */}
      <section className="py-12 md:py-16 bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-section text-gray-900 mb-3">
              Save this estimate for later
            </h2>
            <p className="text-body text-gray-600 max-w-2xl mx-auto mb-4">
              You can come back anytime or share this with someone you trust.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-sm text-blue-700 font-medium">
                Share this safely—nothing can be changed. Use this as a reference, not a commitment.
              </p>
            </div>
          </div>

          {/* Save/Return Action */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
            <div className="text-center mb-6">
              <button
                onClick={async () => {
                  if (shareToken) {
                    // Copy existing share link
                    const shareUrl = `${window.location.origin}/estimate/${shareToken}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert("Link copied to clipboard!");
                    return;
                  }

                  if (!estimate?.estimateId) {
                    alert("Unable to create share link. Please try again.");
                    return;
                  }

                  setCreatingShare(true);
                  try {
                    const res = await fetch("/api/share/create", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        estimateId: estimate.estimateId,
                        expiresInHours: 720, // 30 days
                        singleUse: false,
                        isHomeowner: true,
                      }),
                    });
                    
                    const text = await res.text();
                    if (!text) {
                      alert("Unable to create share link. Please try again.");
                      return;
                    }
                    
                    let data;
                    try {
                      data = JSON.parse(text);
                    } catch (parseError) {
                      alert("Unable to create share link. Please try again.");
                      return;
                    }
                    
                    if (data.token) {
                      setShareToken(data.token);
                      const shareUrl = `${window.location.origin}/estimate/${data.token}`;
                      navigator.clipboard.writeText(shareUrl);
                      
                      // Track share action
                      if (estimate?.estimateId) {
                        try {
                          trackShare(estimate.estimateId);
                        } catch (error) {
                          // Fail silently - tracking should never break the app
                        }
                      }
                      
                      alert("Secure link created and copied to clipboard!");
                    } else {
                      alert(data.error || "Unable to create share link. Please try again.");
                    }
                  } catch (error) {
                    alert("Unable to create share link. Please try again.");
                  } finally {
                    setCreatingShare(false);
                  }
                }}
                disabled={creatingShare}
                type="button"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {creatingShare ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating link...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy secure link
                  </>
                )}
              </button>
              <p className="text-sm text-gray-600 mt-4 mb-2">
                This link opens a read-only version of this estimate.
              </p>
              <p className="text-sm text-gray-700 font-medium text-center">
                Share this safely—nothing can be changed. Come back anytime.
              </p>
            </div>

            {/* Sharing Explanation */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 text-center mb-2">
                Many homeowners share this with a partner or family member before deciding.
              </p>
              <p className="text-sm text-gray-600 text-center font-medium mb-2">
                Designed so anyone can understand the tradeoffs—no technical knowledge needed.
              </p>
              <p className="text-sm text-gray-600 text-center mb-2">
                No calls required. You decide when to talk to someone.
              </p>
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-sm text-gray-700 text-center font-medium">
                  Use this as a reference, not a commitment. Your estimate is read-only and private.
                </p>
              </div>
            </div>

            {/* Privacy Reassurance */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                We don't notify anyone when this link is viewed or shared.
              </p>
              <p className="text-xs text-gray-600 font-medium">
                Share this safely—nothing can be changed. Your estimate is private and secure.
              </p>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleAppointmentRequest}
                type="button"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
              >
                Request appointment
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Done for now
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* What Can Increase the Price Section */}
      <section className="py-12 md:py-16 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-section text-gray-900 mb-6 text-center">
            What Can Increase the Price
          </h2>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-8">
            <ul className="space-y-4">
              <li className="flex items-start text-base text-gray-700">
                <span className="text-amber-600 mr-3 mt-1">•</span>
                <span>Ductwork modifications or replacements needed for proper airflow distribution.</span>
              </li>
              <li className="flex items-start text-base text-gray-700">
                <span className="text-amber-600 mr-3 mt-1">•</span>
                <span>Electrical panel upgrades required to support new system capacity.</span>
              </li>
              <li className="flex items-start text-base text-gray-700">
                <span className="text-amber-600 mr-3 mt-1">•</span>
                <span>Zoning systems or advanced controls for multi-story homes or comfort preferences.</span>
              </li>
              <li className="flex items-start text-base text-gray-700">
                <span className="text-amber-600 mr-3 mt-1">•</span>
                <span>Difficult access requiring specialized equipment or extended installation time.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Estimate Disclaimer */}
      <section className="py-6 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <EstimateDisclaimer />
        </div>
      </section>

      {/* Removed duplicate Side-by-Side Comparison Section - comparison is available in expandable section above */}

      {/* Financing & Monthly Payment Education Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Subtle section separator */}
          <div className="border-t border-gray-200 mb-10"></div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-section text-gray-900 mb-3">
              Estimated monthly payments
            </h2>
            <p className="text-body text-gray-600 max-w-2xl mx-auto">
              This is just to help you understand affordability. You're not applying for anything.
            </p>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm font-medium text-gray-700">View monthly estimates</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showMonthlyEstimates}
                  onChange={(e) => {
                    setShowMonthlyEstimates(e.target.checked);
                    // Track financing view when toggled on
                    if (e.target.checked && estimate?.estimateId) {
                      try {
                        trackFinancingView(estimate.estimateId);
                      } catch (error) {
                        // Fail silently - tracking should never break the app
                      }
                    }
                  }}
                  className="sr-only"
                />
                <div className={`w-14 h-7 rounded-full transition-colors duration-200 ${
                  showMonthlyEstimates ? "bg-primary-600" : "bg-gray-300"
                }`}>
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                    showMonthlyEstimates ? "translate-x-7" : "translate-x-0.5"
                  }`}></div>
                </div>
              </div>
            </label>
          </div>

          {/* Monthly Estimates Display */}
          {showMonthlyEstimates && estimate && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { name: "Good", price: estimate.tierRanges.good.min },
                  { name: "Better", price: estimate.tierRanges.better.min },
                  { name: "Best", price: estimate.tierRanges.best.min },
                ].map((option) => {
                  // Calculate monthly payment: 5-year term at 8% APR (example)
                  const principal = option.price;
                  const annualRate = 0.08;
                  const monthlyRate = annualRate / 12;
                  const numPayments = 60; // 5 years
                  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
                  
                  return (
                    <div key={option.name} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-600 mb-2">{option.name}</div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {formatCurrency(Math.round(monthlyPayment))}
                      </div>
                      <div className="text-xs text-gray-500">per month</div>
                      <div className="text-xs text-gray-500 mt-1">(example)</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assumptions Disclosure */}
          {showMonthlyEstimates && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-6">
              <p className="text-sm text-gray-700 mb-4">
                These examples assume a standard financing term and average rates. Actual terms may vary.
              </p>
              <details className="text-sm text-gray-600">
                <summary className="cursor-pointer font-medium text-gray-900 mb-2 hover:text-primary-700">
                  View example terms
                </summary>
                <div className="mt-3 space-y-2 pl-4">
                  <p>Sample term length: 5-7 years</p>
                  <p>Sample APR range: 6-10% (non-binding)</p>
                </div>
              </details>
            </div>
          )}

          {/* Reassurance Copy */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <p className="text-base text-gray-700 leading-relaxed text-center">
              Many homeowners use financing to spread costs over time. You can review real options later if you choose to move forward.
            </p>
          </div>

          {/* Neutral Navigation Links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => {
                // Scroll to "What Can Lower the Price" section
                const element = document.getElementById("ways-to-reduce");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Ways to reduce the total
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="flex flex-col items-center">
              <p className="text-xs text-gray-500 text-center mb-2">
                Most homeowners here are actively planning a replacement.
              </p>
              <button
                onClick={() => {
                  setSelectedTierForComparison(null);
                  setShowContactForm(true);
                }}
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
              >
                Ready to talk to someone?
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                No calls required. You decide when to talk to someone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Subtle section separator */}
          <div className="border-t border-gray-100 mb-12"></div>
          
          <h2 className="text-section text-gray-900 mb-12 text-center">
            Pricing Ranges by Tier
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

      {/* What Drives Your Estimate Section */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                What Drives Your Estimate Range
              </h2>
            </div>
            
            {/* Regional Pricing Explainer */}
            {estimate.regionalBand && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Why Does Pricing Vary by Region?
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Your estimate reflects regional pricing assumptions based on your ZIP code. 
                  <strong> Your ZIP code never directly determines the final price</strong>—it only influences the range 
                  based on typical regional factors.
                </p>
                <div className="bg-white rounded-lg p-4 mb-3">
                  <p className="text-sm font-medium text-gray-900 mb-2">Your Region: {estimate.regionalBand.label}</p>
                  <p className="text-xs text-gray-600">
                    {estimate.regionalBand.band === "low" && 
                      "This region typically has lower labor rates and material costs, which can reduce installation costs."}
                    {estimate.regionalBand.band === "high" && 
                      "This region typically has higher labor rates, material costs, and permit fees, which can increase installation costs."}
                    {estimate.regionalBand.band === "average" && 
                      "This region has average labor rates and material costs compared to national averages."}
                  </p>
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-2">Regional factors that influence pricing ranges:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-2">
                    <li>Local labor rates and contractor availability</li>
                    <li>Material and equipment costs in your area</li>
                    <li>Local building codes and permit requirements</li>
                    <li>Market competition and demand</li>
                    <li>Cost of living and business overhead</li>
                  </ul>
                  <p className="mt-3 text-xs text-gray-600 italic">
                    <strong>Important:</strong> These are assumptions based on regional averages. 
                    Pricing may vary based on your specific home, equipment selection, and installation requirements.
                  </p>
                </div>
              </div>
            )}
            <p className="text-base text-gray-600 mb-6 leading-relaxed">
              Your estimate range reflects these factors. Pricing may vary based on specific site conditions:
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
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Request Professional Review</h3>
                <p className="text-sm text-gray-600 mt-1">
                  This helps connect you with a licensed contractor for an on-site evaluation. You're not committing to anything.
                </p>
              </div>
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
                      selectedTier: selectedTierForComparison,
                      estimateRange: estimate?.tierRanges,
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
                      trackEvent("contact_form_submitted", { tier: selectedTierForComparison || primaryTier });
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
                      trackEvent("contact_form_submitted", { tier: selectedTierForComparison || primaryTier });
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

              {/* Submit - ONE PRIMARY CTA */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submittingContact || !contactData.consentToContact}
                  className="w-full px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-lg cursor-pointer"
                >
                  {submittingContact ? "Submitting..." : "Request on-site evaluation"}
                </button>
                
                {/* Secondary action - Visually lighter */}
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline-offset-4 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
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
              Next Steps
            </h2>
            <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
              This estimate provides realistic pricing boundaries for homes like yours. An on-site evaluation helps assess site conditions, existing infrastructure, and specific equipment needs.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 mb-8 max-w-2xl mx-auto">
              <p className="text-base text-gray-200 leading-relaxed mb-4">
                <strong className="text-white">What to expect from an on-site evaluation:</strong>
              </p>
              <ul className="text-left text-sm text-gray-300 space-y-2 max-w-xl mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-0.5">•</span>
                  <span>Assessment of existing ductwork and infrastructure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-0.5">•</span>
                  <span>Precise equipment sizing based on actual home conditions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-0.5">•</span>
                  <span>Detailed quote with specific equipment and installation scope</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-0.5">•</span>
                  <span>Pricing that may adjust based on site-specific factors</span>
                </li>
              </ul>
            </div>
            
            {/* ONE PRIMARY CTA - Consistent placement */}
            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => {
                  setSelectedTierForComparison(null);
                  handleAppointmentRequest();
                }}
                type="button"
                className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-200 shadow-lg text-lg cursor-pointer"
              >
                Request on-site evaluation
              </button>
            </div>
            
            <div className="pt-8 border-t border-gray-700">
              <Link
                href="/homeowner/h5"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Review
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final Actions Section */}
      <section className="py-12 md:py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">What would you like to do next?</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Save This Version */}
              <button
                onClick={handleSave}
                disabled={saving}
                type="button"
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                  <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Save this version</h4>
                <p className="text-sm text-gray-600 text-center">
                  {saving ? "Saving..." : "Keep this estimate for later reference or to share with someone you trust."}
                </p>
              </button>

              {/* Reset to Original Estimate */}
              <button
                onClick={() => {
                  // Reload the page to reset to original estimate
                  window.location.reload();
                }}
                type="button"
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                  <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Reset to original estimate</h4>
                <p className="text-sm text-gray-600 text-center">
                  Return to your original estimate based on your initial preferences.
                </p>
              </button>

              {/* Continue Learning */}
              <Link
                href="/why-different"
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                  <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Continue learning</h4>
                <p className="text-sm text-gray-600 text-center">
                  Learn more about how this estimate experience differs from typical HVAC sites.
                </p>
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
      <main id="main-content" className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
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
