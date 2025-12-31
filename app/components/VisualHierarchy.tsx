// Visual Hierarchy Components for Premium Polish
// Reusable components that enforce consistent visual hierarchy

import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
}

// Hero Section - Maximum visual impact
export function HeroSection({ children, className = "" }: SectionProps) {
  return (
    <section className={`relative overflow-hidden py-16 md:py-24 lg:py-32 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-slate-50/30"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

// Page Header - Clear hierarchy for page titles
export function PageHeader({ 
  title, 
  subtitle, 
  className = "" 
}: { 
  title: string; 
  subtitle?: string; 
  className?: string;
}) {
  return (
    <div className={`text-center mb-12 md:mb-16 ${className}`}>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Section Header - For major content sections
export function SectionHeader({ 
  title, 
  description, 
  className = "" 
}: { 
  title: string; 
  description?: string; 
  className?: string;
}) {
  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
        {title}
      </h2>
      {description && (
        <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl">
          {description}
        </p>
      )}
    </div>
  );
}

// Subsection Header - For nested content
export function SubsectionHeader({ 
  title, 
  description, 
  className = "" 
}: { 
  title: string; 
  description?: string; 
  className?: string;
}) {
  return (
    <div className={`mb-6 ${className}`}>
      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

// Premium Card - Elevated visual treatment
export function PremiumCard({ 
  children, 
  className = "",
  variant = "default"
}: { 
  children: ReactNode; 
  className?: string;
  variant?: "default" | "elevated" | "subtle";
}) {
  const variants = {
    default: "bg-white rounded-2xl shadow-lg border border-gray-100",
    elevated: "bg-white rounded-2xl shadow-2xl border border-gray-200",
    subtle: "bg-gray-50 rounded-xl shadow-sm border border-gray-100",
  };

  return (
    <div className={`${variants[variant]} p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
}

// Highlight Box - For important information
export function HighlightBox({ 
  children, 
  variant = "info",
  className = ""
}: { 
  children: ReactNode; 
  variant?: "info" | "success" | "warning" | "primary";
  className?: string;
}) {
  const variants = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    success: "bg-green-50 border-green-200 text-green-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    primary: "bg-primary-50 border-primary-200 text-primary-900",
  };

  return (
    <div className={`rounded-xl border p-4 md:p-6 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

// Premium Button - Consistent button styling
export function PremiumButton({ 
  children, 
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: { 
  children: ReactNode; 
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  [key: string]: any;
}) {
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-md hover:shadow-lg",
    outline: "bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 shadow-md hover:shadow-lg",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`font-semibold rounded-xl transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Divider - Visual separation
export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`border-t border-gray-200 my-8 md:my-12 ${className}`}></div>
  );
}

// Spacer - Consistent spacing utility
export function Spacer({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    sm: "h-4",
    md: "h-8",
    lg: "h-12",
    xl: "h-16",
  };
  return <div className={sizes[size]} />;
}



