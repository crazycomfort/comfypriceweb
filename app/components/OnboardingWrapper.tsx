"use client";

import { ReactNode } from "react";
import OnboardingFlow from "./OnboardingFlow";

interface OnboardingWrapperProps {
  children: ReactNode;
}

const onboardingSteps = [
  {
    id: "welcome",
    title: "Welcome to COMFYpri¢e",
    description:
      "Get transparent, accurate HVAC estimates in just 2 minutes. No hidden fees, no sales calls—just honest pricing to help you make informed decisions.",
  },
  {
    id: "how-it-works",
    title: "How It Works",
    description:
      "Simply answer a few questions about your home and preferences. We'll use regional pricing data to provide you with a personalized estimate range.",
  },
  {
    id: "transparency",
    title: "100% Transparent",
    description:
      "See exactly what goes into your estimate—equipment costs, labor, materials, and more. All assumptions are clearly explained so you know what you're getting.",
  },
  {
    id: "get-started",
    title: "Ready to Get Started?",
    description:
      "Click 'Start Free Estimate' to begin. The entire process takes just 2 minutes, and you'll receive your personalized estimate immediately.",
  },
];

export default function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  return (
    <>
      {children}
      <OnboardingFlow
        steps={onboardingSteps}
        onComplete={() => {
          // Onboarding completed
        }}
        storageKey="homeowner_onboarding_completed"
      />
    </>
  );
}


