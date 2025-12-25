"use client";

interface EstimateDisclaimerProps {
  className?: string;
}

export default function EstimateDisclaimer({ className = "" }: EstimateDisclaimerProps) {
  return (
    <div className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Important: This is a ballpark estimate
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-2">
              This estimate is based on the information you provided and uses general pricing assumptions. 
              <strong> Actual costs may vary significantly</strong> based on:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Specific equipment brands and models selected</li>
              <li>Local contractor rates and availability</li>
              <li>Exact installation requirements and complexity</li>
              <li>Regional material costs and permit fees</li>
              <li>Current market conditions and seasonal factors</li>
            </ul>
            <p className="mt-2">
              <strong>We recommend getting 2-3 quotes from licensed HVAC contractors</strong> in your area 
              for accurate pricing. This estimate is intended as a starting point for your planning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

