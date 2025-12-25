"use client";

import { useState, useEffect } from "react";
import Logo from "./Logo";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  image?: string;
}

interface OnboardingFlowProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  storageKey?: string;
}

export default function OnboardingFlow({
  steps,
  onComplete,
  storageKey = "onboarding_completed",
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      setIsVisible(true);
    }
  }, [storageKey]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true");
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) {
    return null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          handleSkip();
        }
      }}
    >
      <div 
        className="w-full max-w-2xl relative z-[60]"
        onClick={(e) => {
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto relative"
        >
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <Logo size="md" variant="dark-bg" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSkip();
              }}
              type="button"
              className="text-white/80 hover:text-white transition-colors relative z-20 cursor-pointer"
              aria-label="Skip onboarding"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-primary-100 mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 id="onboarding-title" className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">{step.description}</p>

          {step.image && (
            <div className="mb-6 rounded-lg overflow-hidden bg-gray-100">
              <img src={step.image} alt={step.title} className="w-full h-auto" />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              disabled={currentStep === 0}
              type="button"
              className={`px-6 py-3 rounded-lg font-medium transition-colors relative z-20 ${
                currentStep === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
              }`}
            >
              Previous
            </button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentStep(index);
                  }}
                  type="button"
                  className={`w-2 h-2 rounded-full transition-all relative z-20 cursor-pointer ${
                    index === currentStep
                      ? "bg-primary-600 w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              type="button"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors relative z-20 cursor-pointer"
            >
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

