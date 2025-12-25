import Link from "next/link";
import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { validateShareToken } from "@/lib/share-tokens";
import { getEstimateById } from "@/lib/estimate-storage";
import { logEvent } from "@/lib/telemetry";

interface EstimateViewerProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function EstimateViewer({ params }: EstimateViewerProps) {
  const { token } = await params;
  
  if (!isFeatureEnabled("estimateSharing")) {
    notFound();
  }

  const isDevBypass = process.env.NODE_ENV !== "production" && process.env.DEV_BYPASS_AUTH === "true";
  if (isDevBypass && token === "test-token") {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">Shared Estimate</h1>
              <p className="text-sm text-gray-500 mb-2">Version: v1</p>
              <p className="text-sm text-yellow-600 mb-8">⚠️ Dev bypass enabled - not a real estimate</p>
              
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 inline-block mb-8">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                  Estimated Investment Range
                </p>
                <div className="text-4xl md:text-5xl font-bold text-primary-700 mb-2">$5,000 - $7,500</div>
                <p className="text-sm text-gray-500">All-inclusive pricing • No hidden fees</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center">
              <p className="text-base text-gray-600 mb-6 leading-relaxed">
                This is a demo estimate for testing purposes.
              </p>
              <p className="text-base text-gray-600 mb-8 leading-relaxed">
                To test with a real estimate, generate one through the homeowner or contractor flow.
              </p>
              <Link href="/" className="px-8 py-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md text-lg">
                Get Your Own Estimate
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const validation = await validateShareToken(token);
  if (!validation.valid || !validation.estimateId) {
    await logEvent("share_token_invalid", { token: token.substring(0, 10) });
    notFound();
  }

  const estimate = await getEstimateById(validation.estimateId);
  if (!estimate) {
    await logEvent("share_estimate_not_found", { estimateId: validation.estimateId });
    notFound();
  }

  await logEvent("share_link_viewed", {
    estimateId: validation.estimateId,
    version: validation.version,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate option tiers
  const generateOptions = () => {
    const midPoint = (estimate.range.min + estimate.range.max) / 2;
    
    return [
      {
        id: "good",
        name: "Good",
        description: "Reliable, efficient system that meets your basic needs",
        price: estimate.range.min,
        features: [
          "Standard efficiency equipment",
          "Professional installation",
          "Basic warranty coverage",
          "Quality components"
        ]
      },
      {
        id: "better",
        name: "Better",
        description: "Enhanced performance with modern features and improved efficiency",
        price: midPoint,
        features: [
          "Higher efficiency rating",
          "Advanced comfort features",
          "Extended warranty",
          "Energy-saving technology"
        ],
        recommended: true
      },
      {
        id: "best",
        name: "Best",
        description: "Premium system with top-tier efficiency and smart home integration",
        price: estimate.range.max,
        features: [
          "Maximum efficiency rating",
          "Smart thermostat included",
          "Premium warranty coverage",
          "Advanced air quality features"
        ]
      }
    ];
  };

  const options = generateOptions();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
              Your HVAC Estimate
            </h1>
            <p className="text-lg text-gray-600 mb-2 leading-relaxed">
              This estimate was shared with you. All prices are flat-rate and include professional installation.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Version {validation.version} • Shared estimate
            </p>
            
            {/* Price Range Display */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8 inline-block">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                Estimated Investment Range
              </p>
              <div className="text-4xl md:text-5xl font-bold text-primary-700 mb-2">
                {formatCurrency(estimate.range.min)} - {formatCurrency(estimate.range.max)}
              </div>
              <p className="text-sm text-gray-500">
                All-inclusive pricing • No hidden fees
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Options Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 mb-4">
              Choose Your System
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Three tiers to match your needs and budget. Each option includes professional installation 
              and quality equipment from trusted manufacturers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {options.map((option) => (
              <div
                key={option.id}
                className={`bg-white rounded-xl shadow-md border border-gray-100 p-6 relative transition-all duration-300 ${
                  option.recommended
                    ? "ring-2 ring-primary-500 shadow-lg scale-105"
                    : "hover:shadow-lg hover:scale-[1.02]"
                }`}
              >
                {option.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{option.description}</p>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(option.price)}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-600">
                      <svg
                        className="w-5 h-5 text-primary-700 mr-2 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Estimate Details Section */}
      <section className="py-12 md:py-16 bg-white border-y border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 mb-6">
              Estimate Details
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500 mb-1">System Type</dt>
                    <dd className="text-base text-gray-900">{estimate.input.preferences.systemType}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 mb-1">Efficiency Level</dt>
                    <dd className="text-base text-gray-900">{estimate.input.preferences.efficiencyLevel}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 mb-1">Square Footage</dt>
                    <dd className="text-base text-gray-900">{estimate.input.squareFootage.toLocaleString()} sqft</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 mb-1">Location</dt>
                    <dd className="text-base text-gray-900">{estimate.input.zipCode}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Assumptions</h3>
                <p className="text-base text-gray-600 mb-4 leading-relaxed">
                  This estimate is based on standard installation conditions. Final pricing may vary based on:
                </p>
                <ul className="space-y-2">
                  {estimate.assumptions.map((assumption, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-600">
                      <svg
                        className="w-5 h-5 text-primary-700 mr-2 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      <span>{assumption}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 bg-gray-50 p-6 rounded-lg">
              <p className="text-base text-gray-700 leading-relaxed">
                <strong className="text-gray-900">Important:</strong> This is a ballpark estimate. 
                Final pricing may vary based on site inspection, specific requirements, and current market conditions. 
                Contact a licensed HVAC contractor for a detailed quote tailored to your home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-base text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Schedule a consultation with a licensed HVAC professional to get a detailed quote 
              tailored to your specific needs.
            </p>
            
            <Link href="/" className="px-8 py-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md text-lg">
              Get Your Own Estimate
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
