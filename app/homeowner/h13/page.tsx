"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProgressIndicator from "@/app/components/ProgressIndicator";

const STEPS = [
  "Location",
  "Home Basics",
  "Current System",
  "Preferences",
  "Review",
  "Estimate",
  "Ownership",
  "Trust",
  "Summary",
  "Contractors",
  "Appointment",
  "Share",
  "Complete",
];

export default function HomeownerH13() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [estimateRange, setEstimateRange] = useState<{ min: number; max: number } | null>(null);
  const [estimateId, setEstimateId] = useState<string | null>(null);

  useEffect(() => {
    // Get estimate data to show summary
    const estimateIdParam = searchParams.get("estimateId");
    if (estimateIdParam) {
      setEstimateId(estimateIdParam);
      fetch(`/api/homeowner/estimate/${estimateIdParam}`)
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data.estimate) {
              setEstimateRange(data.estimate.range);
            }
          }
        })
        .catch(() => {
          // Silently fail - estimate range is optional
        });
    } else {
      // Try to get from sessionStorage
      try {
        const savedEstimateId = sessionStorage.getItem("homeownerEstimateId");
        if (savedEstimateId) {
          setEstimateId(savedEstimateId);
          fetch(`/api/homeowner/estimate/${savedEstimateId}`)
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                if (data.estimate) {
                  setEstimateRange(data.estimate.range);
                }
              }
            })
            .catch(() => {
              // Silently fail
            });
        }
      } catch (error) {
        // Silently fail
      }
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

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={13} totalSteps={13} stepLabels={STEPS} />

        {/* Completion Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            You're All Set
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            You've completed your HVAC estimate and have everything you need to make an informed decision.
          </p>
        </div>

        {/* What You Accomplished Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">What you accomplished</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Got a realistic price range</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  You received a planning estimate based on your home's characteristics, preferences, and regional pricing. This gives you a clear sense of what to expect before talking to contractors.
                </p>
                {estimateRange && (
                  <p className="text-lg font-semibold text-primary-700 mt-2">
                    {formatCurrency(estimateRange.min)} - {formatCurrency(estimateRange.max)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Learned what drives pricing</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  You understand how home size, system efficiency, installation complexity, and regional factors affect HVAC costs. This knowledge helps you evaluate contractor quotes with confidence.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Have your estimate saved</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Your estimate is saved in this browser. You can return anytime to review it, share it with someone you trust, or request an appointment when you're ready.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Know your next steps</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  You understand that final pricing requires an on-site evaluation, and you're prepared to have informed conversations with contractors when you're ready.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Message Section */}
        <div className="bg-primary-50 rounded-xl border border-primary-200 p-6 md:p-8 mb-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Clarity and Trust</h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              COMFYprice exists to give homeowners realistic expectations about HVAC pricing. We believe informed decisions start with transparent, education-first information—not sales pressure or bait pricing.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              You now have the knowledge and tools to move forward confidently, whether that's today or months from now. The choice is yours.
            </p>
          </div>
        </div>

        {/* Next Options Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">What would you like to do next?</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* View Estimate */}
            <Link
              href={estimateId ? `/homeowner/h6?estimateId=${estimateId}` : "/homeowner/h6"}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Review Your Estimate</h4>
              <p className="text-sm text-gray-600 text-center">
                Return to your estimate summary to review details, options, and next steps.
              </p>
            </Link>

            {/* Share Estimate */}
            <Link
              href={estimateId ? `/homeowner/h12?estimateId=${estimateId}` : "/homeowner/h12"}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Share Your Estimate</h4>
              <p className="text-sm text-gray-600 text-center">
                Create a shareable link to send to a partner, family member, or anyone you trust.
              </p>
            </Link>

            {/* Request Appointment */}
            <Link
              href="/homeowner/h11"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Request Appointment</h4>
              <p className="text-sm text-gray-600 text-center">
                Connect with a professional contractor for an on-site evaluation when you're ready.
              </p>
            </Link>

            {/* Return Home */}
            <Link
              href="/"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Return to Home</h4>
              <p className="text-sm text-gray-600 text-center">
                Go back to the main page to learn more or start a new estimate.
              </p>
            </Link>
          </div>
        </div>

        {/* Final Reassurance */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 md:p-8 text-center">
          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
            <strong className="text-gray-900">Remember:</strong> There's no rush. Take your time to review your estimate, 
            share it with people you trust, and move forward when you're ready. You're in control of the process.
          </p>
        </div>
      </div>
    </main>
  );
}



