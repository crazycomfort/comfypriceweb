import Link from "next/link";
import Logo from "@/app/components/Logo";

export default function EducationPage() {

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary-100 hover:text-white mb-8 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
            <div className="mb-6">
              <Logo size="lg" variant="dark-bg" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              HVAC Education Center
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              Everything you need to know about HVAC systems, efficiency ratings, and making informed decisions for your home.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* System Types Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Understanding HVAC System Types
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Different systems serve different needs. Learn which type might be right for your home.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Central Air */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Central Air Conditioning</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                A central air system uses a network of ducts to distribute cool air throughout your home. It consists of an outdoor condenser unit and an indoor evaporator coil.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700"><strong>Best for:</strong> Homes with existing ductwork</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700"><strong>Efficiency:</strong> SEER 13-21+ available</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700"><strong>Cost:</strong> Moderate to high</span>
                </div>
              </div>
            </div>

            {/* Heat Pump */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Heat Pump</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Heat pumps provide both heating and cooling by transferring heat between indoors and outdoors. They're highly efficient in moderate climates.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700"><strong>Best for:</strong> Moderate climates, year-round comfort</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700"><strong>Efficiency:</strong> SEER 14-22+, HSPF 8-13+</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700"><strong>Cost:</strong> Moderate to high</span>
                </div>
              </div>
            </div>

            {/* Dual Fuel */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Dual Fuel System</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Dual fuel systems combine a heat pump with a gas furnace, automatically switching between the two based on outdoor temperature for optimal efficiency.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700"><strong>Best for:</strong> Cold climates, maximum efficiency</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700"><strong>Efficiency:</strong> Highest efficiency in cold weather</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700"><strong>Cost:</strong> Higher initial investment</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Efficiency Ratings Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Efficiency Ratings Explained
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Understanding efficiency ratings helps you make informed decisions and save money on energy costs.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12">
            {/* SEER Rating */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-700">SEER</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Seasonal Energy Efficiency Ratio
                </h3>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                SEER measures cooling efficiency over an entire cooling season. The higher the SEER rating, the more energy-efficient the system and the lower your cooling costs.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900 mb-1">13-14</div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Basic</div>
                  <p className="text-xs text-gray-600">Standard efficiency, lower upfront cost</p>
                </div>
                <div className="p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                  <div className="text-2xl font-bold text-primary-700 mb-1">15-16</div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Standard</div>
                  <p className="text-xs text-gray-600">Good balance of cost and efficiency</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600 mb-1">17+</div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Premium</div>
                  <p className="text-xs text-gray-600">Maximum efficiency, lower energy bills</p>
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong className="text-gray-900">Example:</strong> A 16 SEER system uses about 25% less energy than a 13 SEER system, 
                  which can save hundreds of dollars per year on cooling costs.
                </p>
              </div>
            </div>

            {/* HSPF Rating */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-700">HSPF</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Heating Seasonal Performance Factor
                </h3>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                HSPF measures heat pump heating efficiency. Similar to SEER, higher HSPF ratings mean better heating performance and lower energy costs.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900 mb-1">7-8</div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Standard</div>
                  <p className="text-xs text-gray-600">Minimum efficiency for new systems</p>
                </div>
                <div className="p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                  <div className="text-2xl font-bold text-primary-700 mb-1">9-10</div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">High</div>
                  <p className="text-xs text-gray-600">Excellent heating efficiency</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600 mb-1">11+</div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Premium</div>
                  <p className="text-xs text-gray-600">Maximum heating efficiency</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Installation Factors Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Installation Complexity Factors
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Several factors can affect installation complexity and cost. Understanding these helps you prepare for your project.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Ductwork Condition",
                description: "Existing ductwork may need modifications, repairs, or replacement. Poorly sealed or damaged ducts reduce efficiency.",
                icon: "🔧",
              },
              {
                title: "Accessibility",
                description: "Easy access to installation locations reduces labor time. Difficult access (tight spaces, high ceilings) increases complexity.",
                icon: "🏗️",
              },
              {
                title: "Electrical & Gas Requirements",
                description: "New systems may require upgraded electrical service or new gas lines, adding to installation costs.",
                icon: "⚡",
              },
              {
                title: "Permits & Inspections",
                description: "Local building codes require permits and inspections for HVAC installations, which may add time and cost.",
                icon: "📋",
              },
              {
                title: "Home Age & Construction",
                description: "Older homes may need structural modifications. Construction type affects installation methods and costs.",
                icon: "🏠",
              },
              {
                title: "Zoning Requirements",
                description: "Multi-level homes may benefit from zoning systems, which add complexity and cost but improve comfort.",
                icon: "🌡️",
              },
            ].map((factor, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">{factor.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{factor.title}</h3>
                <p className="text-gray-600 leading-relaxed">{factor.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What to Ask Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Questions to Ask Your Contractor
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Being prepared with the right questions helps you get accurate quotes and make informed decisions.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "What size system is appropriate for my home?",
                "What efficiency rating should I consider for my climate?",
                "What's included in the installation cost?",
                "What warranty is provided on equipment and labor?",
                "How long will the installation take?",
                "What maintenance is required and how often?",
                "Are permits and inspections included in the quote?",
                "Do you provide a written, itemized estimate?",
                "What financing options are available?",
                "Can you provide references from recent installations?",
                "What happens if there are issues after installation?",
                "Do you offer maintenance plans?",
              ].map((question, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className="w-6 h-6 text-primary-700 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-700 font-medium">{question}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Terminology Glossary */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              HVAC Terminology Glossary
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Common terms you'll encounter when shopping for HVAC systems.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { term: "BTU", definition: "British Thermal Unit - measures heating/cooling capacity. Higher BTU means more powerful system." },
                { term: "Ton", definition: "Unit of cooling capacity. One ton equals 12,000 BTU per hour. Typical homes need 1-5 tons." },
                { term: "Condenser", definition: "Outdoor unit that releases heat from your home. Part of the central air or heat pump system." },
                { term: "Evaporator Coil", definition: "Indoor component that absorbs heat from your home's air. Works with the condenser." },
                { term: "Ductwork", definition: "Network of pipes/channels that distribute conditioned air throughout your home." },
                { term: "Thermostat", definition: "Control device that regulates temperature. Smart thermostats offer advanced features." },
                { term: "Refrigerant", definition: "Chemical that transfers heat in your system. R-410A is the current standard." },
                { term: "Load Calculation", definition: "Professional assessment to determine the right system size for your home." },
                { term: "Zoning", definition: "System that allows different temperature control in different areas of your home." },
                { term: "AFUE", definition: "Annual Fuel Utilization Efficiency - measures furnace efficiency. Higher is better." },
                { term: "MERV Rating", definition: "Minimum Efficiency Reporting Value - measures air filter effectiveness. Higher MERV = better filtration." },
                { term: "Variable Speed", definition: "Compressor or fan that adjusts speed based on demand, improving efficiency and comfort." },
              ].map((item, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.term}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.definition}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Maintenance Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Maintenance Considerations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Regular maintenance keeps your system running efficiently and extends its lifespan.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Annual Maintenance</h3>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Professional tune-ups should be performed annually, ideally before the cooling and heating seasons. This includes cleaning, inspection, and minor adjustments.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Clean or replace air filters monthly</li>
                    <li>Inspect and clean coils</li>
                    <li>Check refrigerant levels</li>
                    <li>Test thermostat calibration</li>
                    <li>Inspect electrical connections</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Benefits of Regular Maintenance</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Maintains efficiency and reduces energy costs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Extends system lifespan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Prevents costly breakdowns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Maintains warranty coverage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Improves indoor air quality</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Your Estimate?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Now that you're informed, get a transparent, ballpark estimate for your HVAC project.
          </p>
          <Link
            href="/homeowner/h1"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl text-lg cursor-pointer"
          >
            Start Your Free Estimate →
          </Link>
        </section>
      </div>
    </main>
  );
}
