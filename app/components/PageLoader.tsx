"use client";

import LoadingSpinner from "./LoadingSpinner";

interface PageLoaderProps {
  message?: string;
  submessage?: string;
}

export default function PageLoader({ message = "Loading...", submessage }: PageLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-8">
      <div className="text-center max-w-md">
        <LoadingSpinner size="lg" />
        <h2 className="mt-6 text-xl font-semibold text-gray-900">{message}</h2>
        {submessage && (
          <p className="mt-2 text-sm text-gray-600">{submessage}</p>
        )}
      </div>
    </div>
  );
}


