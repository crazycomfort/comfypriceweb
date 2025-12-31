"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  text,
  fullScreen = false,
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4",
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-primary-200 border-t-primary-600 ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <p className={`mt-4 text-gray-600 font-medium ${
          size === "sm" ? "text-xs" : size === "md" ? "text-sm" : size === "lg" ? "text-base" : "text-lg"
        }`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}


