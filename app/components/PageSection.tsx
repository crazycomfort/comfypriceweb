import { ReactNode } from "react";

interface PageSectionProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "7xl";
}

export default function PageSection({ 
  children, 
  className = "", 
  maxWidth = "7xl" 
}: PageSectionProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  };

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
        {children}
      </div>
    </section>
  );
}



