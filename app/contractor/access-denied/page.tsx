import Link from "next/link";

export default function ContractorAccessDenied() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Contractor Access Required
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Contractor Tools are available only to registered HVAC contractors.
          </p>
          
          <p className="text-base text-gray-500 mb-8">
            You must sign in with a contractor account to access pricing tools, cost breakdowns, and client estimate generation.
          </p>
          
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Who Can Access Contractor Tools?
            </h3>
            <ul className="space-y-2 text-sm text-primary-800">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>HVAC contractors and technicians</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>HVAC service company staff (Owner Admin, Office, Tech roles)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Requires registration and account approval</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contractor/signin"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
            >
              Sign In as Contractor
            </Link>
            <Link
              href="/contractor/register"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
            >
              Register New Account
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
