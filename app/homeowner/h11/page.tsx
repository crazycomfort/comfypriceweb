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
];

export default function HomeownerH11() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredContact: "email",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [estimateId, setEstimateId] = useState<string | null>(null);
  const [confirmationChecked, setConfirmationChecked] = useState({
    ballpark: false,
    nextSteps: false,
    walkAway: false,
  });

  useEffect(() => {
    // Get estimateId from URL params or sessionStorage
    const estimateIdParam = searchParams.get("estimateId");
    if (estimateIdParam) {
      setEstimateId(estimateIdParam);
    } else {
      try {
        const savedEstimateId = sessionStorage.getItem("homeownerEstimateId");
        if (savedEstimateId) {
          setEstimateId(savedEstimateId);
        }
      } catch (error) {
        // Silently fail
      }
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleConfirmationChange = (key: keyof typeof confirmationChecked) => {
    setConfirmationChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isConfirmationComplete = confirmationChecked.ballpark && confirmationChecked.nextSteps && confirmationChecked.walkAway;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      setError("Please provide either an email address or phone number");
      return;
    }

    if (formData.preferredContact === "email" && !formData.email.trim()) {
      setError("Please provide an email address for email contact");
      return;
    }

    if (formData.preferredContact === "phone" && !formData.phone.trim()) {
      setError("Please provide a phone number for phone contact");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/homeowner/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          preferredContact: formData.preferredContact,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to submit request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting contact request:", error);
      setError("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={11} totalSteps={11} stepLabels={STEPS} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Step 11: Request Professional Review
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            When you're ready, request an on-site evaluation to get final pricing and confirm your options.
          </p>
        </div>

        {/* Contrast with Traditional Sales */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 text-center font-medium">
            No calls required. No pressure. You decide when to talk to someone.
          </p>
        </div>

        {/* What Happens During the Visit */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What happens during the visit</h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            A professional contractor will visit your home to assess your specific situation and provide a detailed estimate.
          </p>
          
          <div className="space-y-3">
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">On-site evaluation:</strong> The contractor will assess your existing system, ductwork, electrical capacity, and installation access points. This evaluation may refine the pricing range based on your home's specific conditions—this is standard professional practice.
              </p>
            </div>
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Detailed estimate:</strong> You'll receive a written estimate that clearly explains what's included, allowing you to understand exactly what affects the final total.
              </p>
            </div>
            <div className="border-l-4 border-primary-600 pl-4">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Questions answered:</strong> You can ask questions about equipment options, installation methods, timeline, and anything else that affects your decision.
              </p>
            </div>
          </div>
        </div>

        {/* Reassurance Section */}
        <div className="bg-primary-50 rounded-xl border border-primary-200 p-6 md:p-8 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">No obligation</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong className="text-gray-900">Requesting an appointment does not commit you to anything.</strong> You're simply requesting information to help you make an informed decision.
            </p>
            <p>
              You can get multiple estimates, take your time to review them, and choose when or if you want to move forward. Reputable contractors understand this is a significant investment and respect your decision-making process.
            </p>
            <p>
              You remain in control throughout the process. There's no pressure to accept any estimate or make a decision immediately.
            </p>
          </div>
        </div>

        {/* Soft Confirmation Step - Human, Calm */}
        {!submitted && !isConfirmationComplete && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Before we continue</h2>
            <p className="text-base text-gray-700 text-center mb-4 max-w-2xl mx-auto leading-relaxed">
              This is a confirmation step. Most homeowners request an on-site evaluation when they're ready to confirm options and timing. You can still make changes later.
            </p>
            <p className="text-sm text-gray-600 text-center mb-2 max-w-xl mx-auto">
              Please confirm you understand the following:
            </p>
            <p className="text-xs text-gray-500 text-center mb-6 max-w-xl mx-auto">
              This does not commit you to anything. You control what happens next.
            </p>
            
            <div className="space-y-4 max-w-2xl mx-auto">
              {/* Checklist Item 1 */}
              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={confirmationChecked.ballpark}
                  onChange={() => handleConfirmationChange("ballpark")}
                  className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-sm text-gray-700 flex-1">
                  I understand this is a ballpark estimate
                </span>
              </label>

              {/* Checklist Item 2 */}
              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={confirmationChecked.nextSteps}
                  onChange={() => handleConfirmationChange("nextSteps")}
                  className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-sm text-gray-700 flex-1">
                  I'm interested in discussing next steps
                </span>
              </label>

              {/* Checklist Item 3 */}
              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={confirmationChecked.walkAway}
                  onChange={() => handleConfirmationChange("walkAway")}
                  className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-sm text-gray-700 flex-1">
                  I know I can walk away at any time
                </span>
              </label>
            </div>

            {/* Continue Button */}
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => {
                  // Scroll to top to show the form that appears
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={!isConfirmationComplete}
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
              >
                Continue to appointment request
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {!isConfirmationComplete && (
                <p className="text-xs text-gray-500 mt-3">
                  Please check all items to continue
                </p>
              )}
            </div>
          </div>
        )}

        {/* Appointment Request Form */}
        {!submitted && isConfirmationComplete && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Request an appointment</h2>
            <p className="text-sm text-gray-600 mb-6">
              You're simply requesting a conversation. This does not commit you to anything.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white"
                  placeholder="Your name"
                />
              </div>

              {/* Preferred Contact Method */}
              <div>
                <label htmlFor="preferredContact" className="block text-sm font-semibold text-gray-900 mb-2">
                  How would you like to be contacted?
                </label>
                <select
                  id="preferredContact"
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Email {formData.preferredContact === "email" && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required={formData.preferredContact === "email"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white"
                  placeholder="your@email.com"
                />
                {formData.preferredContact === "phone" && (
                  <p className="text-xs text-gray-500 mt-1">Optional if you prefer phone contact</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone {formData.preferredContact === "phone" && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required={formData.preferredContact === "phone"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 bg-white"
                  placeholder="(555) 123-4567"
                />
                {formData.preferredContact === "email" && (
                  <p className="text-xs text-gray-500 mt-1">Optional if you prefer email contact</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 text-center mb-2">
                  <strong className="text-gray-900">You control what happens next.</strong> This does not commit you to anything.
                </p>
                <p className="text-xs text-gray-600 text-center">
                  This is a clarity step. You're requesting professional review, not committing to anything.
                </p>
              </div>
              <p className="text-xs text-gray-400 text-center mb-4">
                This estimate is most accurate when you're considering next steps.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Request Appointment"
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Message */
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Request submitted</h2>
              <p className="text-lg text-gray-700 mb-4">
                Thank you for your request. A contractor will contact you at your preferred method to schedule an on-site evaluation.
              </p>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 text-center">
                  <strong className="text-gray-900">Remember: You control what happens next.</strong> This does not commit you to anything. You're simply requesting a conversation.
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                You should hear from someone within 1–2 business days. If you have questions in the meantime, you can always save or share your estimate for reference.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={estimateId ? `/homeowner/h13?estimateId=${estimateId}` : "/homeowner/h13"}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
                >
                  Continue
                </Link>
                <Link
                  href="/homeowner/h6"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  View Your Estimate
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        {!submitted && (
          <div className="mt-8 flex justify-between items-center">
            <Link
              href="/homeowner/h10"
              className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

