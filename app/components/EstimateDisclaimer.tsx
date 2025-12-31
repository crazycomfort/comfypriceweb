"use client";

interface EstimateDisclaimerProps {
  className?: string;
}

// Single global disclaimer component - reused everywhere
// Normalizes final adjustments - on-site evaluation may refine pricing, this is professional
export default function EstimateDisclaimer({ className = "" }: EstimateDisclaimerProps) {
  return (
    <div className={`bg-gray-50 border border-gray-200 p-4 rounded-lg ${className}`}>
      <p className="text-meta text-gray-700 text-center">
        This range reflects common installation scenarios. An on-site evaluation may refine pricing based on your home's specific conditions—this is standard professional practice.
      </p>
    </div>
  );
}


