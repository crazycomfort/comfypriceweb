"use client";

interface SkeletonLoaderProps {
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string;
  height?: string;
  className?: string;
  lines?: number;
}

export default function SkeletonLoader({
  variant = "text",
  width,
  height,
  className = "",
  lines = 1,
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";

  const variants = {
    text: "h-4",
    circular: "rounded-full",
    rectangular: "",
    card: "h-48 rounded-xl",
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variants.text}`}
            style={{
              width: i === lines - 1 ? "60%" : width || "100%",
              height: height || undefined,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={{
        width: width || (variant === "circular" ? "40px" : "100%"),
        height: height || (variant === "circular" ? "40px" : undefined),
      }}
    />
  );
}


