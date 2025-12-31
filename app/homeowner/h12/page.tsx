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
];

export default function HomeownerH12() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [creatingShare, setCreatingShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const [estimateId, setEstimateId] = useState<string | null>(null);
  const [estimateRange, setEstimateRange] = useState<{ min: number; max: number } | null>(null);

  useEffect(() => {
    // Get estimate data from sessionStorage or URL params
    const estimateIdParam = searchParams.get("estimateId");
    if (estimateIdParam) {
      setEstimateId(estimateIdParam);
      // Fetch estimate to get range
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
          // Fetch estimate to get range
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
              // Silently fail - estimate range is optional
            });
        }
      } catch (error) {
        // Silently fail
      }
    }
  }, [searchParams]);

  const handleCreateShareLink = async () => {
    if (!estimateId) {
      // If no estimateId, we can still create a simple share link based on current URL
      const currentUrl = window.location.origin + window.location.pathname;
      setShareUrl(currentUrl);
      setShareLink(currentUrl);
      return;
    }

    setCreatingShare(true);
    try {
      const response = await fetch("/api/share/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimateId,
          expiresInHours: 720, // 30 days
          singleUse: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const fullUrl = `${window.location.origin}${data.url}`;
        setShareUrl(fullUrl);
        setShareLink(fullUrl);
      } else {
        const errorData = await response.json().catch(() => ({}));
        // If feature is disabled or estimate not found, fallback gracefully
        if (response.status === 403 || response.status === 404) {
          // Fallback: create a simple URL-based share
          const currentUrl = window.location.origin + `/homeowner/h6?estimateId=${estimateId}`;
          setShareUrl(currentUrl);
          setShareLink(currentUrl);
        } else {
          // Other errors: fallback to current URL
          const currentUrl = window.location.origin + window.location.pathname;
          setShareUrl(currentUrl);
          setShareLink(currentUrl);
        }
      }
    } catch (error) {
      // Fallback to current URL if API fails
      const currentUrl = window.location.origin + window.location.pathname;
      setShareUrl(currentUrl);
      setShareLink(currentUrl);
    } finally {
      setCreatingShare(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      try {
        await navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (error) {
        console.error("Failed to copy link:", error);
      }
    }
  };

  const handleCopyMessage = async () => {
    const message = getSuggestedMessage();
    try {
      await navigator.clipboard.writeText(message);
      setMessageCopied(true);
      setTimeout(() => setMessageCopied(false), 3000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const getSuggestedMessage = (): string => {
    const rangeText = estimateRange
      ? `$${estimateRange.min.toLocaleString()} - $${estimateRange.max.toLocaleString()}`
      : "an estimate";
    
    return `I got an HVAC replacement estimate for ${rangeText}. Can you take a look and let me know what you think?`;
  };

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={12} totalSteps={12} stepLabels={STEPS} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Step 12: Share & Return
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Many homeowners save their estimate and share it with family or a partner before making decisions. Taking time is expected and normal.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-blue-700 font-medium">
              Share this safely—nothing can be changed. Use this as a reference, not a commitment.
            </p>
          </div>
        </div>

        {/* Create Share Link Section */}
        {!shareLink && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create a shareable link</h2>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              Generate a secure, read-only link that you can share with a partner, family member, or anyone else you'd like to review your estimate.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <p className="text-sm text-gray-700 text-center mb-2 font-medium">
                Share this safely—nothing can be changed.
              </p>
              <p className="text-sm text-gray-600 text-center">
                Use this as a reference, not a commitment. Come back anytime.
              </p>
            </div>
            <button
              onClick={handleCreateShareLink}
              disabled={creatingShare}
              className="w-full px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
            >
              {creatingShare ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating link...
                </span>
              ) : (
                "Create Shareable Link"
              )}
            </button>
          </div>
        )}

        {/* Share Link Display Section */}
        {shareLink && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your shareable link</h2>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              This link opens a read-only version of your estimate. Anyone with this link can view it, but they cannot edit or change anything.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-700 text-center font-medium">
                Share this safely—nothing can be changed. Your estimate is secure and read-only.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-xs font-medium text-gray-500 uppercase">Shareable Link</span>
              </div>
              <p className="text-sm text-gray-900 break-all font-mono bg-white p-2 rounded border border-gray-300">
                {shareLink}
              </p>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Link copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
          </div>
        )}

        {/* Suggested Message Section */}
        {shareLink && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Suggested message</h2>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              You can copy this message to send along with your shareable link. Feel free to edit it to match your style.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
              <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                {getSuggestedMessage()}
              </p>
            </div>

            <button
              onClick={handleCopyMessage}
              className="w-full px-8 py-3 bg-white border-2 border-primary-600 text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              {messageCopied ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Message copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Message
                </>
              )}
            </button>
          </div>
        )}

        {/* Privacy & Safety Reassurance */}
        <div className="bg-primary-50 rounded-xl border border-primary-200 p-6 md:p-8 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Safety</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900 mb-1">Read-only access</p>
                <p>Anyone with the link can view your estimate, but they cannot edit, change, or delete anything. Your original estimate remains unchanged. <strong>Share this safely—nothing can be changed.</strong></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900 mb-1">No account required</p>
                <p>The person you share with doesn't need to create an account or provide any personal information to view the estimate.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900 mb-1">You control who sees it</p>
                <p>Only people you share the link with can access your estimate. We don't notify anyone when the link is viewed, and the link doesn't appear in search engines.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900 mb-1">Link expiration</p>
                <p>Share links expire after 30 days for security. You can always create a new link if you need to share again later.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Return Options */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Return anytime</h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            Your estimate is saved in this browser. You can return to review it, share it again, or request an appointment when you're ready.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <p className="text-sm text-gray-700 text-center font-medium">
              Come back anytime. Use this as a reference, not a commitment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/homeowner/h6"
              className="flex flex-col items-center justify-center p-6 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">View Your Estimate</h4>
              <p className="text-sm text-gray-600 text-center">
                Return to your estimate summary and review all the details.
              </p>
            </Link>

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
                Go back to the main page to start a new estimate or learn more.
              </p>
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/homeowner/h11"
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

