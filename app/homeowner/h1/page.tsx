"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressIndicator from "@/app/components/ProgressIndicator";
import HelpTooltip from "@/app/components/HelpTooltip";
import ErrorMessage from "@/app/components/ErrorMessage";
import LiveRegion from "@/app/components/LiveRegion";

const STEPS = [
  "Location",
  "Home Basics",
  "Current System",
  "Preferences",
  "Review",
];

export default function HomeownerH1() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState("");
  const [autoDetect, setAutoDetect] = useState(false);
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");

  // Format ZIP code as user types
  const formatZipCode = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    
    // Format as 12345 or 12345-6789
    if (digits.length <= 5) {
      return digits;
    } else {
      return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`;
    }
  };

  // Validate ZIP code format
  const validateZipCode = (zip: string): boolean => {
    return /^\d{5}(-\d{4})?$/.test(zip.trim());
  };

  // Handle ZIP code input change
  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatZipCode(e.target.value);
    setZipCode(formatted);
    setError("");
    setIsValid(false);
    
    // Real-time validation
    if (formatted.length >= 5) {
      const valid = validateZipCode(formatted);
      setIsValid(valid);
      if (valid) {
        setLiveMessage("Valid ZIP code format");
      } else if (formatted.length === 5) {
        setLiveMessage("ZIP code format is valid. You can add the optional 4-digit extension.");
      }
    } else {
      setIsValid(false);
      setLiveMessage("");
    }
  };

  // Auto-detect location
  const handleAutoDetect = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsValidating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocode to get ZIP code
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          // Try to extract ZIP from postal code
          if (data.postcode) {
            const formatted = formatZipCode(data.postcode);
            setZipCode(formatted);
            setIsValid(validateZipCode(formatted));
            setLiveMessage(`Location detected: ${data.city || data.locality || "Your area"}`);
          } else {
            setError("Could not determine ZIP code from your location");
          }
        } catch (err) {
          setError("Failed to detect location. Please enter your ZIP code manually.");
        } finally {
          setIsValidating(false);
        }
      },
      (err) => {
        setError("Location access denied. Please enter your ZIP code manually.");
        setIsValidating(false);
      }
    );
  };

  const handleNext = () => {
    setError("");
    setLiveMessage("");
    
    // Validate ZIP code
    if (!zipCode || zipCode.trim().length === 0) {
      setError("Please enter a ZIP code");
      setLiveMessage("ZIP code is required");
      return;
    }
    
    if (!validateZipCode(zipCode)) {
      setError("Please enter a valid ZIP code (5 digits, optionally followed by -4 digits)");
      setLiveMessage("Invalid ZIP code format");
      return;
    }

    try {
      const data = { zipCode: zipCode.trim(), autoDetect };
      sessionStorage.setItem("homeownerEstimateInput", JSON.stringify(data));
      setLiveMessage("ZIP code saved. Proceeding to next step...");
      router.push("/homeowner/h2");
    } catch (error) {
      console.error("Error saving form data:", error);
      setError("An error occurred. Please try again.");
      setLiveMessage("Error saving form data");
    }
  };

  // Load saved data if available
  useEffect(() => {
    const saved = sessionStorage.getItem("homeownerEstimateInput");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.zipCode) {
          setZipCode(parsed.zipCode);
          setIsValid(validateZipCode(parsed.zipCode));
        }
        if (parsed.autoDetect) {
          setAutoDetect(parsed.autoDetect);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={1} totalSteps={5} stepLabels={STEPS} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Step 1: Location
          </h1>
          <p className="text-lg text-gray-600">
            We'll use your location to provide accurate regional pricing
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-6">
          <LiveRegion message={liveMessage} />
          
          <div>
            <label htmlFor="zipcode" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              ZIP Code <span className="text-red-500">*</span>
              <HelpTooltip content="Your ZIP code helps us calculate accurate regional pricing, labor costs, and local market conditions. We use this to provide the most accurate estimate possible." />
            </label>
            <div className="relative">
              <input
                type="text"
                id="zipcode"
                name="zipcode"
                value={zipCode}
                onChange={handleZipChange}
                placeholder="12345 or 12345-6789"
                maxLength={10}
                required
                aria-required="true"
                aria-invalid={error ? "true" : isValid ? "false" : undefined}
                aria-describedby={error ? "zipcode-error" : "zipcode-help"}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white placeholder:text-gray-400 ${
                  error 
                    ? "border-red-300 bg-red-50" 
                    : isValid && zipCode.length >= 5
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300"
                }`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isValid) {
                    handleNext();
                  }
                }}
              />
              {isValidating && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-200 border-t-primary-600"></div>
                </div>
              )}
              {!isValidating && isValid && zipCode.length >= 5 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            {error && (
              <div id="zipcode-error" className="mt-2" role="alert">
                <ErrorMessage message={error} type="error" />
              </div>
            )}
            <p id="zipcode-help" className="mt-2 text-sm text-gray-500">
              Your ZIP code helps us calculate accurate regional pricing and labor costs.
              {zipCode.length > 0 && zipCode.length < 5 && (
                <span className="block mt-1 text-xs text-gray-400">
                  {5 - zipCode.length} more digit{5 - zipCode.length !== 1 ? "s" : ""} needed
                </span>
              )}
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-lg border border-primary-100">
            <button
              type="button"
              onClick={handleAutoDetect}
              disabled={isValidating}
              className="mt-1 flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Detecting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Auto-detect
                </>
              )}
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Use my current location
              </p>
              <p className="text-xs text-gray-600 mt-1">
                We'll use your browser's location to automatically fill in your ZIP code
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <button
            onClick={handleNext}
            disabled={!isValid || zipCode.trim().length < 5}
            type="button"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:transform-none cursor-pointer"
          >
            Continue
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
