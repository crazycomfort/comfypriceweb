import Link from "next/link";
import { getContractorInfo } from "@/lib/contractor-access";
import { getCompanySetupStatus } from "@/lib/company-setup";

export default async function ContractorSetupRequired() {
  const contractorInfo = await getContractorInfo();
  const setupStatus = await getCompanySetupStatus(contractorInfo?.companyId || null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4">Company Setup Required</h1>
          <p className="text-gray-600 mb-6">
            Please complete your company setup before accessing contractor tools.
          </p>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Setup Progress</span>
              <span className="text-sm text-gray-600">{setupStatus.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${setupStatus.progress}%` }}
              />
            </div>
          </div>

          {setupStatus.missingFields.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Missing Information:</h2>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {setupStatus.missingFields.map((field, index) => (
                  <li key={index}>{field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4">
            <Link
              href="/contractor/company-setup"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Complete Setup
            </Link>
            <Link
              href="/"
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

