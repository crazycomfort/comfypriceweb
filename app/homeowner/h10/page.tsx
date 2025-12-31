"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
];

export default function HomeownerH10() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    try {
      const saved = sessionStorage.getItem("homeownerEstimateInput");
      if (saved) {
        localStorage.setItem("homeownerEstimateSaved", saved);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving estimate:", error);
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={10} totalSteps={10} stepLabels={STEPS} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Step 10: Introducing Contractors
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            When you're ready, connecting with a professional contractor is the next step to get final pricing and move forward with your project.
          </p>
        </div>

        {/* Contrast with Traditional Sales */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700 text-center font-medium">
            No calls required. No pressure. You decide when to talk to someone.
          </p>
        </div>

        {/* What a Contractor Visit Does and Does Not Mean */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What a contractor visit means</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2 text-sm">What it does:</h3>
              <ul className="space-y-2 text-sm text-gray-700 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Provides an on-site evaluation to assess your home's specific conditions and needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Delivers a detailed written estimate based on actual site conditions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Answers your questions about equipment options, installation methods, and timeline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Helps you understand what affects final pricing and what options are available</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2 text-sm">What it does not mean:</h3>
              <ul className="space-y-2 text-sm text-gray-700 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>You're committing to anything by requesting a visit or receiving an estimate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>You must accept the first estimate you receive—you can get multiple estimates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>You need to make a decision immediately—take your time to review and compare</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>You're locked into working with a specific contractor—you remain in control</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Trust Criteria Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What to look for in a contractor</h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            When you're ready to work with a professional, consider these trust criteria. Reputable professionals will meet these standards.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="border-l-4 border-primary-600 pl-4">
                <h3 className="font-medium text-gray-900 mb-1 text-sm">Licensing & Insurance</h3>
                <p className="text-sm text-gray-700">
                  Properly licensed for HVAC work in your area and carries adequate liability insurance.
                </p>
              </div>
              <div className="border-l-4 border-primary-600 pl-4">
                <h3 className="font-medium text-gray-900 mb-1 text-sm">Written Estimates</h3>
                <p className="text-sm text-gray-700">
                  Provides detailed written estimates that clearly separate equipment, labor, and materials.
                </p>
              </div>
              <div className="border-l-4 border-primary-600 pl-4">
                <h3 className="font-medium text-gray-900 mb-1 text-sm">Warranty Coverage</h3>
                <p className="text-sm text-gray-700">
                  Clear warranty terms covering both parts and labor, with documentation you can review.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="border-l-4 border-primary-600 pl-4">
                <h3 className="font-medium text-gray-900 mb-1 text-sm">Transparent Communication</h3>
                <p className="text-sm text-gray-700">
                  Answers questions clearly, explains options without pressure, and respects your timeline.
                </p>
              </div>
              <div className="border-l-4 border-primary-600 pl-4">
                <h3 className="font-medium text-gray-900 mb-1 text-sm">Local Experience</h3>
                <p className="text-sm text-gray-700">
                  Familiar with local code requirements, climate considerations, and typical installation challenges in your area.
                </p>
              </div>
              <div className="border-l-4 border-primary-600 pl-4">
                <h3 className="font-medium text-gray-900 mb-1 text-sm">References Available</h3>
                <p className="text-sm text-gray-700">
                  Willing to provide references from previous customers or has verifiable reviews from your area.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Choices Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">What would you like to do?</h2>
          
          <p className="text-sm text-gray-500 text-center mb-4">
            This is informational. You're not committing to anything.
          </p>
          <p className="text-xs text-gray-400 text-center mb-6">
            Most homeowners here are actively planning a replacement.
          </p>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* Request Appointment */}
            <button
              onClick={() => router.push("/homeowner/h11")}
              type="button"
              className="flex flex-col items-center justify-center p-6 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Request appointment</h4>
              <p className="text-sm text-gray-600 text-center mb-2">
                Connect with a professional contractor for an on-site evaluation and detailed estimate.
              </p>
              <p className="text-xs text-gray-500 text-center">
                You're simply requesting a conversation. This does not commit you to anything.
              </p>
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              type="button"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Save</h4>
              <p className="text-sm text-gray-600 text-center">
                {saved ? "Saved! Return anytime." : "Keep this estimate for later reference."}
              </p>
            </button>

            {/* Share */}
            <button
              onClick={() => {
                // Copy current URL or estimate link to clipboard
                const estimateData = sessionStorage.getItem("homeownerEstimateInput");
                if (estimateData) {
                  // In a real implementation, this would create a share link
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard! You can share this with someone you trust.");
                }
              }}
              type="button"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Share</h4>
              <p className="text-sm text-gray-600 text-center">
                Share this estimate with a partner or family member before deciding.
              </p>
            </button>
          </div>
        </div>

        {/* Reassurance Section */}
        <div className="bg-primary-50 rounded-xl border border-primary-200 p-6 md:p-8 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">You're in control</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong className="text-gray-900">You control what happens next.</strong> Requesting an appointment does not commit you to anything. You're simply requesting a conversation to get answers to your questions and receive a detailed estimate based on your actual home conditions.
            </p>
            <p>
              You can save this estimate, share it with someone you trust, or come back to it later. When you're ready to move forward, you'll have realistic expectations and can make informed decisions.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/homeowner/h9"
            className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
      </div>
    </main>
  );
}

