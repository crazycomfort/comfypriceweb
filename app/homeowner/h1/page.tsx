"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressIndicator from "@/app/components/ProgressIndicator";
import ErrorMessage from "@/app/components/ErrorMessage";
import LiveRegion from "@/app/components/LiveRegion";
import { SecondarySection, SecondaryHeader, PrimaryCTA, SecondaryCTA } from "@/app/components/SectionHierarchy";

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
    // Clear any error state when user manually enters ZIP
    setError("");
    
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
      // Browser doesn't support geolocation - this is fine, user can enter manually
      setLiveMessage("Location access is optional. ZIP code works just fine.");
      return;
    }

    setIsValidating(true);
    setError("");
    setLiveMessage("");

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
            setAutoDetect(true);
            setLiveMessage(`Location detected: ${data.city || data.locality || "Your area"}`);
          } else {
            // Couldn't get ZIP from location - gracefully fall back
            setLiveMessage("Location access is optional. ZIP code works just fine.");
          }
        } catch (err) {
          // Location detection failed - gracefully fall back
          setLiveMessage("Location access is optional. ZIP code works just fine.");
        } finally {
          setIsValidating(false);
        }
      },
      (err) => {
        // User denied location or error occurred - gracefully fall back, no error state
        setLiveMessage("Location access is optional. ZIP code works just fine.");
        setIsValidating(false);
        // Explicitly clear any error state
        setError("");
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
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SecondarySection>
        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator currentStep={1} totalSteps={5} stepLabels={STEPS} />
        </div>

        {/* Header */}
        <SecondaryHeader
          title="Step 1: Location"
          subtitle="HVAC pricing varies significantly by region due to labor rates, local codes, and equipment availability."
          align="center"
          className="mb-6"
        />
        
        {/* ACKNOWLEDGE REAL FEARS - Without dramatizing */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
          <p className="text-sm text-gray-700 leading-relaxed">
            Many homeowners want to understand pricing before talking to anyone. This helps you know what questions to ask and what to expect, so you don't overpay or feel pressured.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100/80 p-8 md:p-10 space-y-8">
          <LiveRegion message={liveMessage} />
          
          <div>
            <label htmlFor="zipcode" className="block text-base font-bold text-gray-900 mb-3">
              ZIP Code <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Your ZIP code helps us generate a realistic regional price range rather than a generic estimate.
            </p>
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
                className={`w-full px-5 py-4 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white placeholder:text-gray-400 text-base ${
                  error 
                    ? "border-red-300 bg-red-50" 
                    : isValid && zipCode.length >= 5
                    ? "border-green-400 bg-green-50"
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
            {zipCode.length > 0 && zipCode.length < 5 && (
              <p className="mt-2 text-xs text-gray-400">
                {5 - zipCode.length} more digit{5 - zipCode.length !== 1 ? "s" : ""} needed
              </p>
            )}
            {isValid && zipCode.length >= 5 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  You're doing this the smart way—before talking to anyone.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={handleAutoDetect}
              disabled={isValidating}
              className="mt-1 flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
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
              <p className="text-sm text-gray-700">
                Use your current location to auto-fill your ZIP code. You can enter it manually if you prefer.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Location access is optional. ZIP code works just fine.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation - ONE PRIMARY CTA */}
        <div className="mt-12 flex justify-between items-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline-offset-4 hover:underline"
          >
            Back to Home
          </Link>
          <button
            onClick={handleNext}
            disabled={!isValid || zipCode.trim().length < 5}
            type="button"
            className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-lg cursor-pointer"
          >
            Continue
          </button>
        </div>
      </SecondarySection>
    </main>
  );
}
