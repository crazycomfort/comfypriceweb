"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressIndicator from "@/app/components/ProgressIndicator";
import { isFeatureEnabled } from "@/lib/feature-flags";
import HelpTooltip from "@/app/components/HelpTooltip";

const STEPS = [
  "Location",
  "Home Basics",
  "Current System",
  "Preferences",
  "Review",
];

export default function HomeownerH5() {
  const router = useRouter();
  const detailedEstimateEnabled = isFeatureEnabled("detailedEstimate");
  const [formData, setFormData] = useState({
    accessDifficulty: "",
    permits: "",
    timeline: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interpretation, setInterpretation] = useState<any>(null);
  const [estimateRange, setEstimateRange] = useState<{ min: number; max: number } | null>(null);
  const [originalEstimateRange, setOriginalEstimateRange] = useState<{ min: number; max: number } | null>(null);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exploredFactors, setExploredFactors] = useState<Record<string, boolean>>({});
  const [toggledEfficiency, setToggledEfficiency] = useState<string | null>(null);
  const [toggledSystemType, setToggledSystemType] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load and interpret user's choices, then generate estimate range
  useEffect(() => {
    const saved = sessionStorage.getItem("homeownerEstimateInput");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInterpretation(parsed);
        
        // Generate estimate range if we have required data
        if (parsed.zipCode && parsed.squareFootage && parsed.floors && parsed.homeAge && 
            parsed.preferences?.efficiencyLevel && parsed.preferences?.systemType) {
          generateEstimateRange(parsed);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const generateEstimateRange = async (data: any) => {
    setIsLoadingEstimate(true);
    try {
      const response = await fetch("/api/homeowner/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zipCode: data.zipCode,
          squareFootage: data.squareFootage,
          floors: data.floors,
          homeAge: data.homeAge,
          existingSystem: data.existingSystem || {},
          preferences: {
            efficiencyLevel: data.preferences?.efficiencyLevel,
            systemType: data.preferences?.systemType,
            smartFeatures: data.preferences?.smartFeatures || false,
          },
          installationFactors: data.installationFactors || {},
        }),
      });

      if (response.ok) {
        const estimate = await response.json();
        if (estimate.range) {
          const range = {
            min: estimate.range.min,
            max: estimate.range.max,
          };
          setEstimateRange(range);
          setOriginalEstimateRange(range);
        }
      }
    } catch (error) {
      console.error("Error generating estimate range:", error);
    } finally {
      setIsLoadingEstimate(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleToggleEfficiency = async (newEfficiency: string) => {
    if (!interpretation || !originalEstimateRange) return;
    
    const isResetting = toggledEfficiency === newEfficiency;
    if (isResetting) {
      // Reset to original
      setToggledEfficiency(null);
      setIsAnimating(true);
      setTimeout(() => {
        setEstimateRange(originalEstimateRange);
        setIsAnimating(false);
      }, 300);
      return;
    }

    setIsAnimating(true);
    setToggledEfficiency(newEfficiency);

    try {
      const response = await fetch("/api/homeowner/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zipCode: interpretation.zipCode,
          squareFootage: interpretation.squareFootage,
          floors: interpretation.floors,
          homeAge: interpretation.homeAge,
          existingSystem: interpretation.existingSystem || {},
          preferences: {
            efficiencyLevel: newEfficiency,
            systemType: toggledSystemType || interpretation.preferences?.systemType,
            smartFeatures: interpretation.preferences?.smartFeatures || false,
          },
          installationFactors: interpretation.installationFactors || {},
        }),
      });

      if (response.ok) {
        const estimate = await response.json();
        if (estimate.range) {
          setTimeout(() => {
            setEstimateRange({
              min: estimate.range.min,
              max: estimate.range.max,
            });
            setIsAnimating(false);
          }, 300);
        }
      }
    } catch (error) {
      console.error("Error calculating toggled estimate:", error);
      setIsAnimating(false);
    }
  };

  const handleToggleSystemType = async (newSystemType: string) => {
    if (!interpretation || !originalEstimateRange) return;
    
    const isResetting = toggledSystemType === newSystemType;
    if (isResetting) {
      // Reset to original
      setToggledSystemType(null);
      setIsAnimating(true);
      setTimeout(() => {
        setEstimateRange(originalEstimateRange);
        setIsAnimating(false);
      }, 300);
      return;
    }

    setIsAnimating(true);
    setToggledSystemType(newSystemType);

    try {
      const response = await fetch("/api/homeowner/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zipCode: interpretation.zipCode,
          squareFootage: interpretation.squareFootage,
          floors: interpretation.floors,
          homeAge: interpretation.homeAge,
          existingSystem: interpretation.existingSystem || {},
          preferences: {
            efficiencyLevel: toggledEfficiency || interpretation.preferences?.efficiencyLevel,
            systemType: newSystemType,
            smartFeatures: interpretation.preferences?.smartFeatures || false,
          },
          installationFactors: interpretation.installationFactors || {},
        }),
      });

      if (response.ok) {
        const estimate = await response.json();
        if (estimate.range) {
          setTimeout(() => {
            setEstimateRange({
              min: estimate.range.min,
              max: estimate.range.max,
            });
            setIsAnimating(false);
          }, 300);
        }
      }
    } catch (error) {
      console.error("Error calculating toggled estimate:", error);
      setIsAnimating(false);
    }
  };

  const handleSaveEstimate = () => {
    try {
      const saved = sessionStorage.getItem("homeownerEstimateInput");
      if (saved) {
        // Save to localStorage for persistence
        localStorage.setItem("homeownerEstimateSaved", saved);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving estimate:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    setFormData(newData);
    
    // Save to sessionStorage immediately
    try {
      const existingData = sessionStorage.getItem("homeownerEstimateInput");
      const allData = existingData ? JSON.parse(existingData) : {};
      allData.installationFactors = {
        ...allData.installationFactors,
        [e.target.name]: e.target.value,
      };
      sessionStorage.setItem("homeownerEstimateInput", JSON.stringify(allData));
    } catch (error) {
      console.error("Error saving installation factors:", error);
    }
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h5/page.tsx:35',message:'handleNext called',data:{formData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
      // #endregion
      
      // Collect all form data from session storage
      const existingData = sessionStorage.getItem("homeownerEstimateInput");
      if (!existingData) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h5/page.tsx:40',message:'No existing data in sessionStorage',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        alert("Form data lost. Please start over from the beginning.");
        router.push("/homeowner/h1");
        setIsSubmitting(false);
        return;
      }

      let parsedData;
      try {
        parsedData = JSON.parse(existingData);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h5/page.tsx:49',message:'Parsed sessionStorage data',data:{parsedData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
        // #endregion
      } catch (parseError) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h5/page.tsx:51',message:'Parse error',data:{error:String(parseError)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.error("Error parsing form data:", parseError);
        alert("Form data is corrupted. Please start over from the beginning.");
        router.push("/homeowner/h1");
        setIsSubmitting(false);
        return;
      }

      // Ensure all required fields are present and properly formatted
      // Convert all values to correct types
      const allData: any = {
        zipCode: String(parsedData.zipCode || "").trim(),
        squareFootage: Number(parsedData.squareFootage) || 0,
        floors: Number(parsedData.floors) || 0,
        homeAge: String(parsedData.homeAge || "").trim(),
        existingSystem: parsedData.existingSystem || {},
        preferences: {
          efficiencyLevel: String(parsedData.preferences?.efficiencyLevel || "").trim(),
          systemType: String(parsedData.preferences?.systemType || "").trim(),
          smartFeatures: parsedData.preferences?.smartFeatures !== undefined 
            ? Boolean(parsedData.preferences.smartFeatures)
            : undefined,
        },
        installationFactors: {
          accessDifficulty: formData.accessDifficulty || undefined,
          permits: formData.permits || undefined,
          timeline: formData.timeline || undefined,
        },
      };
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h5/page.tsx:74',message:'Data prepared before validation',data:{allData,types:{zipCode:typeof allData.zipCode,squareFootage:typeof allData.squareFootage,floors:typeof allData.floors,homeAge:typeof allData.homeAge,smartFeatures:typeof allData.preferences.smartFeatures}},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
      // #endregion
      
      // Final validation - ensure numbers are valid
      if (isNaN(allData.squareFootage) || allData.squareFootage <= 0) {
        alert("Invalid square footage. Please go back to Step 2 and enter a valid value.");
        setIsSubmitting(false);
        return;
      }
      
      if (isNaN(allData.floors) || allData.floors < 1) {
        alert("Invalid number of floors. Please go back to Step 2 and enter a valid value.");
        setIsSubmitting(false);
        return;
      }

      // Validate before proceeding
      const { validateHomeownerInput } = await import("@/lib/form-validation");
      const errors = validateHomeownerInput(allData);
      
      if (errors.length > 0) {
        const errorMessage = errors.map(e => `${e.field}: ${e.message}`).join("\n");
        console.error("Validation errors:", errors);
        alert(`Please complete all required fields:\n\n${errorMessage}\n\nPlease go back and fill in the missing information.`);
        setIsSubmitting(false);
        return;
      }

      // Ensure smartFeatures is a boolean (not undefined or null)
      // Normalize any value to a proper boolean
      if (allData.preferences.smartFeatures === undefined || allData.preferences.smartFeatures === null) {
        allData.preferences.smartFeatures = false;
      } else if (typeof allData.preferences.smartFeatures === "string") {
        // Handle string values
        allData.preferences.smartFeatures = allData.preferences.smartFeatures === "true" || allData.preferences.smartFeatures === "yes";
      } else {
        // Ensure it's a boolean
        allData.preferences.smartFeatures = Boolean(allData.preferences.smartFeatures);
      }

      // Double-check critical fields
      if (!allData.zipCode || !allData.squareFootage || !allData.floors || !allData.homeAge) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h5/page.tsx:107',message:'Missing critical fields',data:{allData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        alert("Missing required information. Please go back and complete all steps.");
        setIsSubmitting(false);
        return;
      }

      if (!allData.preferences.efficiencyLevel || !allData.preferences.systemType) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h5/page.tsx:113',message:'Missing preferences',data:{preferences:allData.preferences},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        alert("Missing preference information. Please go back to Step 4 and complete your preferences.");
        setIsSubmitting(false);
        return;
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5aaccbce-ff16-40c7-a4c0-32e39943fc7c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'h5/page.tsx:119',message:'Data validated, saving to sessionStorage',data:{allData,jsonString:JSON.stringify(allData)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
      // #endregion
      
      sessionStorage.setItem("homeownerEstimateInput", JSON.stringify(allData));
      router.push("/homeowner/h6");
    } catch (error) {
      console.error("Error saving form data:", error);
      alert(`An error occurred: ${error instanceof Error ? error.message : "Unknown error"}\n\nPlease try again or start over.`);
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={5} totalSteps={5} stepLabels={STEPS} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Step 5: Understanding Your Choices
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Let's interpret what your choices mean before we show you pricing ranges. This is a planning estimate to help you understand what to expect—not a final bid.
          </p>
        </div>

        {/* What We Considered Section */}
        {interpretation && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">What we considered for your home</h2>
            
            <div className="space-y-3">
              {/* Home Size Range */}
              {interpretation.squareFootage && (
                <div className="flex items-start gap-3">
                  <span className="text-primary-600 mt-1">•</span>
                  <p className="text-sm text-gray-700 flex-1">
                    <strong className="text-gray-900">Home size:</strong>{" "}
                    {interpretation.squareFootage >= 4000
                      ? "4,000+ square feet"
                      : interpretation.squareFootage >= 3000
                      ? "3,000–3,999 square feet"
                      : interpretation.squareFootage >= 2500
                      ? "2,500–2,999 square feet"
                      : interpretation.squareFootage >= 2000
                      ? "2,000–2,499 square feet"
                      : interpretation.squareFootage >= 1500
                      ? "1,500–1,999 square feet"
                      : interpretation.squareFootage >= 1000
                      ? "1,000–1,499 square feet"
                      : "Under 1,000 square feet"}
                  </p>
                </div>
              )}

              {/* Number of Floors */}
              {interpretation.floors && (
                <div className="flex items-start gap-3">
                  <span className="text-primary-600 mt-1">•</span>
                  <p className="text-sm text-gray-700 flex-1">
                    <strong className="text-gray-900">Number of floors:</strong>{" "}
                    {interpretation.floors === 1
                      ? "Single-story home"
                      : interpretation.floors === 2
                      ? "Two-story home"
                      : interpretation.floors === 3
                      ? "Three-story home"
                      : `${interpretation.floors} floors`}
                  </p>
                </div>
              )}

              {/* Home Age Category */}
              {interpretation.homeAge && (
                <div className="flex items-start gap-3">
                  <span className="text-primary-600 mt-1">•</span>
                  <p className="text-sm text-gray-700 flex-1">
                    <strong className="text-gray-900">Home age:</strong>{" "}
                    {interpretation.homeAge === "new" || interpretation.homeAge === "0-10"
                      ? "Newer home (0–10 years)"
                      : interpretation.homeAge === "10-20"
                      ? "Mid-age home (10–20 years)"
                      : interpretation.homeAge === "20-30"
                      ? "Older home (20–30 years)"
                      : interpretation.homeAge === "30+"
                      ? "Older home (30+ years)"
                      : interpretation.homeAge === "old"
                      ? "Older home"
                      : "Home age considered"}
                  </p>
                </div>
              )}

              {/* Current System Type */}
              {interpretation.existingSystem?.systemType && (
                <div className="flex items-start gap-3">
                  <span className="text-primary-600 mt-1">•</span>
                  <p className="text-sm text-gray-700 flex-1">
                    <strong className="text-gray-900">Current system:</strong>{" "}
                    {interpretation.existingSystem.systemType === "central-air"
                      ? "Central air conditioning"
                      : interpretation.existingSystem.systemType === "heat-pump"
                      ? "Heat pump system"
                      : interpretation.existingSystem.systemType === "dual-fuel"
                      ? "Dual-fuel system"
                      : interpretation.existingSystem.systemType === "furnace"
                      ? "Furnace with separate cooling"
                      : "Existing system noted"}
                  </p>
                </div>
              )}

              {/* Efficiency Preference */}
              {interpretation.preferences?.efficiencyLevel && (
                <div className="flex items-start gap-3">
                  <span className="text-primary-600 mt-1">•</span>
                  <p className="text-sm text-gray-700 flex-1">
                    <strong className="text-gray-900">Efficiency preference:</strong>{" "}
                    {interpretation.preferences.efficiencyLevel === "premium"
                      ? "Best efficiency (higher upfront cost, lower monthly bills)"
                      : interpretation.preferences.efficiencyLevel === "standard"
                      ? "Better efficiency (balanced upfront cost and savings)"
                      : "Good efficiency (lower upfront cost, higher monthly bills)"}
                  </p>
                </div>
              )}

              {/* System Type Preference */}
              {interpretation.preferences?.systemType && (
                <div className="flex items-start gap-3">
                  <span className="text-primary-600 mt-1">•</span>
                  <p className="text-sm text-gray-700 flex-1">
                    <strong className="text-gray-900">System type preference:</strong>{" "}
                    {interpretation.preferences.systemType === "central-air"
                      ? "Cooling only"
                      : interpretation.preferences.systemType === "heat-pump"
                      ? "Heating and cooling in one system"
                      : "Maximum efficiency for cold climates"}
                  </p>
                </div>
              )}

              {/* Smart Features */}
              {interpretation.preferences?.smartFeatures !== undefined && (
                <div className="flex items-start gap-3">
                  <span className="text-primary-600 mt-1">•</span>
                  <p className="text-sm text-gray-700 flex-1">
                    <strong className="text-gray-900">Thermostat:</strong>{" "}
                    {interpretation.preferences.smartFeatures
                      ? "Smart thermostat with remote control"
                      : "Standard thermostat"}
                  </p>
                </div>
              )}

              {/* Location */}
              {interpretation.zipCode && (
                <div className="flex items-start gap-3">
                  <span className="text-primary-600 mt-1">•</span>
                  <p className="text-sm text-gray-700 flex-1">
                    <strong className="text-gray-900">Location:</strong>{" "}
                    ZIP code {interpretation.zipCode}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interpretation Section */}
        {interpretation && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">What your choices tell us</h2>
            
            <div className="space-y-6">
              {/* Home Size Interpretation */}
              {interpretation.squareFootage && (
                <div className="border-l-4 border-primary-600 pl-4">
                  <h3 className="font-medium text-gray-900 mb-2">Your home size</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {interpretation.squareFootage >= 4000 
                      ? "Homes this size typically require larger capacity systems to maintain consistent comfort throughout. Installation complexity increases with square footage, as ductwork routing and system balancing become more involved."
                      : interpretation.squareFootage >= 2500
                      ? "Homes in this size range are common for full system replacements. Most installations include complete system replacement with standard ductwork considerations."
                      : "Smaller homes typically allow for more straightforward installations, though system sizing must still match the home's heating and cooling needs."}
                  </p>
                </div>
              )}

              {/* System Type Interpretation */}
              {interpretation.preferences?.systemType && (
                <div className="border-l-4 border-primary-600 pl-4">
                  <h3 className="font-medium text-gray-900 mb-2">Your system choice</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {interpretation.preferences.systemType === "central-air"
                      ? "Cooling-only systems are typically the most straightforward installations when you already have reliable heating. This keeps the scope focused on your cooling needs."
                      : interpretation.preferences.systemType === "heat-pump"
                      ? "Heat pumps provide both heating and cooling in one system, which simplifies your home's climate control. This typically involves replacing both your heating and cooling equipment."
                      : "Dual-fuel systems combine the efficiency of heat pumps with the reliability of gas furnaces for extreme cold. This provides maximum performance year-round but involves more complex installation."}
                  </p>
                </div>
              )}

              {/* Efficiency Interpretation */}
              {interpretation.preferences?.efficiencyLevel && (
                <div className="border-l-4 border-primary-600 pl-4">
                  <h3 className="font-medium text-gray-900 mb-2">Your efficiency priority</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {interpretation.preferences.efficiencyLevel === "premium"
                      ? "Higher efficiency systems cost more upfront but significantly reduce monthly energy bills over time. This choice prioritizes long-term savings and improved reliability."
                      : interpretation.preferences.efficiencyLevel === "standard"
                      ? "Balanced efficiency provides a good middle ground between upfront cost and long-term energy savings. This is the most common choice for homeowners."
                      : "Standard efficiency keeps upfront costs lower, which can be helpful for budget planning. Monthly energy bills will be higher, but the initial investment is more manageable."}
                  </p>
                </div>
              )}

              {/* Home Age Interpretation */}
              {interpretation.homeAge && (
                <div className="border-l-4 border-primary-600 pl-4">
                  <h3 className="font-medium text-gray-900 mb-2">Your home's age</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {interpretation.homeAge === "new" || interpretation.homeAge === "0-10"
                      ? "Newer homes typically allow for more straightforward installations with fewer infrastructure surprises. Existing ductwork and electrical systems are usually in good condition."
                      : interpretation.homeAge === "10-20"
                      ? "Mid-age homes may need some infrastructure updates, but most installations proceed without major complications. Ductwork and electrical systems are usually adequate."
                      : "Older homes more frequently require infrastructure updates during HVAC replacement. This might include ductwork modifications, electrical upgrades, or code compliance work that affects installation scope."}
                  </p>
                </div>
              )}

              {/* Smart Features Interpretation */}
              {interpretation.preferences?.smartFeatures !== undefined && (
                <div className="border-l-4 border-primary-600 pl-4">
                  <h3 className="font-medium text-gray-900 mb-2">Your thermostat preference</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {interpretation.preferences.smartFeatures
                      ? "Smart thermostats provide better comfort control and energy visibility. This adds to upfront cost but can help you manage energy usage more effectively."
                      : "Standard thermostats provide reliable temperature control without the added cost of smart features. This keeps upfront costs toward the lower end of the range."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* What Typically Drives Cost Section */}
        {interpretation && (
          <div id="what-drives-cost" className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">What typically drives cost for homes like yours</h2>
            
            <div className="space-y-3">
              {/* System Capacity - based on square footage */}
              {interpretation.squareFootage && (
                <div className="flex items-start gap-3">
                  <span className="text-primary-600 mt-1">•</span>
                  <p className="text-sm text-gray-700 flex-1">
                    <strong className="text-gray-900">System capacity required:</strong>{" "}
                    {interpretation.squareFootage >= 4000
                      ? "Larger homes need higher-capacity systems to maintain consistent comfort throughout all areas."
                      : interpretation.squareFootage >= 2500
                      ? "Homes in this size range typically require mid-to-large capacity systems to handle the heating and cooling load."
                      : "Standard capacity systems are typically sufficient for homes this size."}
                  </p>
                </div>
              )}

              {/* Installation Complexity - based on floors and home age */}
              {(interpretation.floors > 1 || (interpretation.homeAge && (interpretation.homeAge === "old" || interpretation.homeAge === "30+" || interpretation.homeAge === "20-30"))) && (
                <div className="flex items-start gap-3">
                  <span className="text-primary-600 mt-1">•</span>
                  <p className="text-sm text-gray-700 flex-1">
                    <strong className="text-gray-900">Installation complexity:</strong>{" "}
                    {interpretation.floors > 1 && (interpretation.homeAge === "old" || interpretation.homeAge === "30+" || interpretation.homeAge === "20-30")
                      ? "Multi-story homes combined with older construction often require more complex ductwork routing and system balancing."
                      : interpretation.floors > 1
                      ? "Multi-story homes typically need additional airflow balancing to maintain even comfort across floors."
                      : "Older homes more frequently require infrastructure updates during installation, which can increase complexity."}
                  </p>
                </div>
              )}

              {/* Electrical or Ductwork Updates - based on home age */}
              {interpretation.homeAge && (interpretation.homeAge === "old" || interpretation.homeAge === "30+" || interpretation.homeAge === "20-30") && (
                <div className="flex items-start gap-3">
                  <span className="text-primary-600 mt-1">•</span>
                  <p className="text-sm text-gray-700 flex-1">
                    <strong className="text-gray-900">Infrastructure updates:</strong>{" "}
                    Older homes often need electrical panel upgrades, ductwork modifications, or code compliance work to support modern HVAC systems.
                  </p>
                </div>
              )}

              {/* Efficiency Level Impact */}
              {interpretation.preferences?.efficiencyLevel && (
                <div className="flex items-start gap-3">
                  <span className="text-primary-600 mt-1">•</span>
                  <p className="text-sm text-gray-700 flex-1">
                    <strong className="text-gray-900">Efficiency level chosen:</strong>{" "}
                    {interpretation.preferences.efficiencyLevel === "premium"
                      ? "Higher efficiency systems cost more upfront due to advanced technology and components, but reduce long-term operating costs."
                      : interpretation.preferences.efficiencyLevel === "standard"
                      ? "Balanced efficiency systems provide a middle ground between upfront cost and long-term energy savings."
                      : "Standard efficiency systems keep upfront costs lower but result in higher monthly energy expenses over time."}
                  </p>
                </div>
              )}

              {/* System Type Complexity - heat pump or dual-fuel */}
              {interpretation.preferences?.systemType && (interpretation.preferences.systemType === "heat-pump" || interpretation.preferences.systemType === "dual-fuel") && (
                <div className="flex items-start gap-3">
                  <span className="text-primary-600 mt-1">•</span>
                  <p className="text-sm text-gray-700 flex-1">
                    <strong className="text-gray-900">System type scope:</strong>{" "}
                    {interpretation.preferences.systemType === "dual-fuel"
                      ? "Dual-fuel systems combine heat pump and gas furnace equipment, requiring more complex installation than single-system replacements."
                      : "Heat pump systems provide both heating and cooling, which typically involves replacing both systems and may require additional installation work."}
                  </p>
                </div>
              )}

              {/* Smart Features */}
              {interpretation.preferences?.smartFeatures && (
                <div className="flex items-start gap-3">
                  <span className="text-primary-600 mt-1">•</span>
                  <p className="text-sm text-gray-700 flex-1">
                    <strong className="text-gray-900">Comfort control features:</strong>{" "}
                    Smart thermostats and advanced controls add to upfront cost but provide better energy management and comfort control.
                  </p>
                </div>
              )}

              {/* Regional Factors - always include if we have location */}
              {interpretation.zipCode && (
                <div className="flex items-start gap-3">
                  <span className="text-primary-600 mt-1">•</span>
                  <p className="text-sm text-gray-700 flex-1">
                    <strong className="text-gray-900">Regional factors:</strong>{" "}
                    Labor rates, local code requirements, and equipment availability in your area influence installation costs.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing Range Section */}
        {estimateRange && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
            <div className="text-center">
              {/* PRICE ANCHOR - Industry-grounded context */}
              <p className="text-base text-gray-700 mb-4 leading-relaxed">
                Most professionally installed systems for homes like yours fall within this range
              </p>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Planning range</h2>
              <div className="mb-4">
                <p className="text-lg text-gray-700 mb-3">
                  This range reflects common installation scenarios that licensed contractors typically encounter:
                </p>
                <div className={`text-4xl md:text-5xl font-bold text-primary-600 mb-2 transition-all duration-300 ${isAnimating ? "opacity-50 scale-95" : "opacity-100 scale-100"}`}>
                  {formatCurrency(estimateRange.min)} – {formatCurrency(estimateRange.max)}
                </div>
                {(toggledEfficiency || toggledSystemType) && (
                  <p className="text-xs text-amber-600 font-medium mb-2">
                    Illustrative range based on toggled preferences
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto mb-3">
                Ranges exist because installation costs vary based on site conditions, existing infrastructure, and specific equipment selections. This range reflects what licensed contractors typically quote after evaluation. Final pricing is confirmed after an on-site evaluation.
              </p>
              <p className="text-xs text-gray-500 text-center max-w-xl mx-auto">
                This estimate is most accurate when you're considering next steps.
              </p>
            </div>

            {/* Interactive Toggles */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-4 text-center">Explore how different choices affect your range:</p>
              
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* Efficiency Toggle */}
                {interpretation?.preferences?.efficiencyLevel && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Efficiency level
                    </label>
                    <div className="space-y-2">
                      {["basic", "standard", "premium"].map((level) => {
                        const isCurrent = !toggledEfficiency && level === interpretation.preferences.efficiencyLevel;
                        const isToggled = toggledEfficiency === level;
                        const isActive = isCurrent || isToggled;
                        
                        return (
                          <button
                            key={level}
                            onClick={() => handleToggleEfficiency(level)}
                            type="button"
                            disabled={isAnimating}
                            className={`w-full text-left px-3 py-2 rounded border text-sm transition-all cursor-pointer disabled:opacity-50 ${
                              isActive
                                ? "border-primary-600 bg-primary-50 text-primary-700 font-medium"
                                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                            }`}
                          >
                            {level === "premium"
                              ? "Best efficiency"
                              : level === "standard"
                              ? "Better efficiency"
                              : "Good efficiency"}
                            {isCurrent && " (current)"}
                            {isToggled && !isCurrent && " (illustrative)"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* System Type Toggle */}
                {interpretation?.preferences?.systemType && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      System type
                    </label>
                    <div className="space-y-2">
                      {["central-air", "heat-pump", "dual-fuel"].map((type) => {
                        const isCurrent = !toggledSystemType && type === interpretation.preferences.systemType;
                        const isToggled = toggledSystemType === type;
                        const isActive = isCurrent || isToggled;
                        
                        return (
                          <button
                            key={type}
                            onClick={() => handleToggleSystemType(type)}
                            type="button"
                            disabled={isAnimating}
                            className={`w-full text-left px-3 py-2 rounded border text-sm transition-all cursor-pointer disabled:opacity-50 ${
                              isActive
                                ? "border-primary-600 bg-primary-50 text-primary-700 font-medium"
                                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                            }`}
                          >
                            {type === "central-air"
                              ? "Cooling only"
                              : type === "heat-pump"
                              ? "Heating and cooling in one system"
                              : "Maximum efficiency for cold climates"}
                            {isCurrent && " (current)"}
                            {isToggled && !isCurrent && " (illustrative)"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {(toggledEfficiency || toggledSystemType) && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setToggledEfficiency(null);
                      setToggledSystemType(null);
                      setIsAnimating(true);
                      setTimeout(() => {
                        setEstimateRange(originalEstimateRange);
                        setIsAnimating(false);
                      }, 300);
                    }}
                    type="button"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                  >
                    Reset to your original preferences
                  </button>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  This exploration helps you understand cost drivers. Final recommendations depend on an in-home evaluation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* How to Use This Estimate Reassurance Block */}
        {estimateRange && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How to use this estimate</h3>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
              <p>
                This estimate is designed for planning and budgeting. It helps you understand what to expect before you talk to contractors or make decisions.
              </p>
              <p>
                Final pricing depends on site conditions that can only be evaluated in person—things like existing ductwork condition, electrical capacity, and access to equipment locations.
              </p>
              <p>
                Having this range helps you understand what to expect. When you're ready to move forward, you'll have realistic expectations and can ask informed questions about what affects the final total.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-sm text-gray-700 font-medium">
                Easy to review with a spouse or family member. Designed so anyone can understand the tradeoffs.
              </p>
            </div>
          </div>
        )}

        {/* Ways This Estimate Could Change - Two Column Layout */}
        {estimateRange && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ways this estimate could change</h2>
            <p className="text-sm text-gray-600 mb-6">
              These factors typically affect pricing ranges. Your actual estimate depends on site conditions evaluated during an on-site visit.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column: Ways to Lower the Range - Dynamic */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ways to lower the range</h3>
                <ul className="space-y-3">
                  {/* Efficiency Level - Show if they chose premium or standard */}
                  {interpretation?.preferences?.efficiencyLevel && (interpretation.preferences.efficiencyLevel === "premium" || interpretation.preferences.efficiencyLevel === "standard") && (
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-sm text-gray-700">
                        <strong className="text-gray-900">Choose standard efficiency:</strong> Good efficiency systems keep upfront costs lower. Impact: {interpretation.preferences.efficiencyLevel === "premium" ? "typically significant" : "typically moderate"}.
                      </span>
                    </li>
                  )}

                  {/* System Type - Show if they chose heat pump or dual-fuel */}
                  {interpretation?.preferences?.systemType && (interpretation.preferences.systemType === "heat-pump" || interpretation.preferences.systemType === "dual-fuel") && (
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-sm text-gray-700">
                        <strong className="text-gray-900">Staying with cooling-only:</strong> If you have reliable heating, replacing only the cooling system keeps the scope focused. Impact: typically {interpretation.preferences.systemType === "dual-fuel" ? "significant" : "moderate"}.
                      </span>
                    </li>
                  )}

                  {/* Smart Features - Show if they chose smart features */}
                  {interpretation?.preferences?.smartFeatures && (
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-sm text-gray-700">
                        <strong className="text-gray-900">Deferring smart features:</strong> Standard thermostats provide reliable control without the added cost. Impact: typically modest.
                      </span>
                    </li>
                  )}

                  {/* Existing Infrastructure - Always show */}
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-sm text-gray-700">
                      <strong className="text-gray-900">Existing infrastructure in good condition:</strong> If ductwork, electrical, and access points don't need updates, costs typically stay lower. Impact: typically {interpretation?.homeAge && (interpretation.homeAge === "old" || interpretation.homeAge === "30+" || interpretation.homeAge === "20-30") ? "moderate to significant" : "modest to moderate"}.
                    </span>
                  </li>

                  {/* Flexible Timing - Always show */}
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-sm text-gray-700">
                      <strong className="text-gray-900">Flexible installation timing:</strong> Allowing contractors to schedule during slower periods can sometimes reduce costs. Impact: typically modest.
                    </span>
                  </li>

                  {/* Standard Installation - Always show */}
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-sm text-gray-700">
                      <strong className="text-gray-900">Standard installation complexity:</strong> Straightforward access and standard equipment placement help keep costs lower. Impact: typically modest to moderate.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Right Column: Ways the Range May Increase - Dynamic */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ways the range may increase</h3>
                <ul className="space-y-3">
                  {/* Higher Efficiency - Show if they chose basic or standard */}
                  {interpretation?.preferences?.efficiencyLevel && (interpretation.preferences.efficiencyLevel === "basic" || interpretation.preferences.efficiencyLevel === "standard") && (
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 mt-1">•</span>
                      <span className="text-sm text-gray-700">
                        <strong className="text-gray-900">Upgrading to higher efficiency equipment:</strong> Higher efficiency systems use advanced components and technology that cost more to manufacture and install, which increases upfront costs but reduces long-term energy expenses.
                      </span>
                    </li>
                  )}

                  {/* Heat Pump vs Traditional - Show if they chose central-air */}
                  {interpretation?.preferences?.systemType === "central-air" && (
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 mt-1">•</span>
                      <span className="text-sm text-gray-700">
                        <strong className="text-gray-900">Heat pump vs traditional system:</strong> Heat pumps provide both heating and cooling in one system, which requires replacing both systems and often involves more complex installation work, increasing the total project scope.
                      </span>
                    </li>
                  )}

                  {/* Electrical or Ductwork Updates - Show if older home */}
                  {interpretation?.homeAge && (interpretation.homeAge === "old" || interpretation.homeAge === "30+" || interpretation.homeAge === "20-30") && (
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 mt-1">•</span>
                      <span className="text-sm text-gray-700">
                        <strong className="text-gray-900">Electrical or ductwork updates in older homes:</strong> Older homes often need electrical panel upgrades to support modern HVAC systems, and existing ductwork may require modifications or replacement to meet current efficiency standards, adding to installation costs.
                      </span>
                    </li>
                  )}

                  {/* Zoning or Comfort Upgrades - Show if they didn't choose smart features */}
                  {interpretation?.preferences?.smartFeatures === false && (
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 mt-1">•</span>
                      <span className="text-sm text-gray-700">
                        <strong className="text-gray-900">Zoning or comfort upgrades:</strong> Adding zoning systems or smart controls requires additional equipment, wiring, and installation work to create separate temperature zones throughout your home, which increases the project scope and cost.
                      </span>
                    </li>
                  )}

                  {/* Dual-Fuel System - Show if they chose heat pump or central-air */}
                  {interpretation?.preferences?.systemType && (interpretation.preferences.systemType === "heat-pump" || interpretation.preferences.systemType === "central-air") && (
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 mt-1">•</span>
                      <span className="text-sm text-gray-700">
                        <strong className="text-gray-900">Dual-fuel system for cold climates:</strong> Dual-fuel systems combine heat pump and gas furnace equipment, requiring installation of both systems and automatic switching controls, which increases equipment and installation costs.
                      </span>
                    </li>
                  )}

                  {/* Complex Installation - Always show if multi-story */}
                  {interpretation?.floors > 1 && (
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 mt-1">•</span>
                      <span className="text-sm text-gray-700">
                        <strong className="text-gray-900">Complex installation conditions:</strong> Multi-story homes require additional ductwork routing and airflow balancing to maintain even comfort across floors, which increases installation time and material requirements.
                      </span>
                    </li>
                  )}

                  {/* Smart Features - Show if they didn't choose smart features */}
                  {interpretation?.preferences?.smartFeatures === false && (
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 mt-1">•</span>
                      <span className="text-sm text-gray-700">
                        <strong className="text-gray-900">Smart thermostat and controls:</strong> Smart thermostats require Wi-Fi connectivity setup and may need additional wiring or equipment, adding to both equipment and installation costs.
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                These are general guidelines. Actual changes depend on your specific situation and will be confirmed during an on-site evaluation.
              </p>
            </div>
          </div>
        )}

        {isLoadingEstimate && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary-200 border-t-primary-600 mb-4"></div>
              <p className="text-sm text-gray-600">Calculating your estimate range...</p>
            </div>
          </div>
        )}

        {/* Planning Estimate Explanation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <div className="bg-slate-50 border-l-4 border-primary-600 rounded-r-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">This is a planning estimate, not a bid</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  The pricing ranges you'll see next reflect realistic expectations for homes like yours based on your choices. They account for typical installation scenarios with professional equipment and installation.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Final pricing requires an on-site evaluation. Site conditions, existing infrastructure, and specific equipment selections can adjust the final total. This estimate helps you plan and set realistic expectations—it's not a binding quote.
                </p>
              </div>
            </div>
          </div>

          {/* Optional Installation Factors */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 mb-4">Optional: Installation factors (these may affect final pricing)</p>
            
            <div>
              <label htmlFor="accessDifficulty" className="block text-sm font-semibold text-gray-900 mb-2">
                Access Difficulty
              </label>
              <select
                id="accessDifficulty"
                name="accessDifficulty"
                value={formData.accessDifficulty}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white"
              >
                <option value="">Standard installation (default)</option>
                <option value="easy">Easy - Standard installation</option>
                <option value="average">Average - Some complexity</option>
                <option value="difficult">Difficult - Complex installation</option>
              </select>
            </div>

            <div>
              <label htmlFor="permits" className="block text-sm font-semibold text-gray-900 mb-2">
                Permit Requirements
              </label>
              <select
                id="permits"
                name="permits"
                value={formData.permits}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white"
              >
                <option value="">Unknown (default)</option>
                <option value="yes">Yes, permits required</option>
                <option value="no">No permits needed</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label htmlFor="timeline" className="block text-sm font-semibold text-gray-900 mb-2">
                Timeline
              </label>
              <select
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white"
              >
                <option value="">No specific timeline (default)</option>
                <option value="urgent">Urgent (within 1 month)</option>
                <option value="soon">Soon (1-3 months)</option>
                <option value="planning">Planning (3-6 months)</option>
                <option value="future">Future (6+ months)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Next Options */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">What would you like to do next?</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Save This Estimate */}
            <button
              onClick={handleSaveEstimate}
              type="button"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Save this estimate</h4>
              <p className="text-sm text-gray-600 text-center mb-2">
                {saved ? "Saved! Come back anytime." : "Keep this estimate for later reference or to share with someone you trust."}
              </p>
              {!saved && (
                <p className="text-xs text-gray-500 text-center font-medium">
                  Use this as a reference, not a commitment.
                </p>
              )}
            </button>

            {/* Learn What Could Raise or Lower This Range */}
            <button
              onClick={() => {
                // Scroll to the "What typically drives cost" section
                const element = document.getElementById("what-drives-cost");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                } else {
                  // If section doesn't exist, scroll to top of page
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              type="button"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Learn what could raise or lower this range</h4>
              <p className="text-sm text-gray-600 text-center">
                Understand the factors that move pricing within the range you see.
              </p>
            </button>

            {/* Talk to a Professional When Ready */}
            <button
              onClick={() => {
                router.push("/homeowner/h6");
              }}
              type="button"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Talk to a professional when ready</h4>
              <p className="text-sm text-gray-600 text-center">
                View your detailed estimate and contact options when you're ready to move forward.
              </p>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/homeowner/h4"
            className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
          <button
            onClick={handleNext}
            type="button"
            disabled={isSubmitting}
            className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-lg cursor-pointer"
          >
            {isSubmitting ? "Generating..." : "Get My Estimate"}
          </button>
        </div>
      </div>
    </main>
  );
}
