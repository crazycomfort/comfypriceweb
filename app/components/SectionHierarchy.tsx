// Global Visual Hierarchy System Components
// Enforces consistent hierarchy: Primary → Secondary → Tertiary
// Rules: Only one primary CTA per view, secondary actions de-emphasized

import { ReactNode } from "react";

// ============================================
// PRIMARY SECTIONS - Hero-level, maximum impact
// ============================================

interface PrimarySectionProps {
  children: ReactNode;
  className?: string;
  background?: "default" | "gradient" | "solid";
}

export function PrimarySection({ 
  children, 
  className = "",
  background = "default"
}: PrimarySectionProps) {
  const backgrounds = {
    default: "bg-gradient-to-b from-gray-50 to-white",
    gradient: "bg-gradient-to-br from-primary-50/60 via-white to-slate-50/60",
    solid: "bg-white",
  };

  return (
    <section className={`section-primary ${backgrounds[background]} ${className}`}>
      <div className="section-primary-content">
        {children}
      </div>
    </section>
  );
}

interface PrimaryHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PrimaryHeader({ title, subtitle, className = "" }: PrimaryHeaderProps) {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="section-primary-title text-gray-900">
        {title}
      </h1>
      {subtitle && (
        <p className="section-primary-subtitle mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ============================================
// SECONDARY SECTIONS - Education, informational
// ============================================

interface SecondarySectionProps {
  children: ReactNode;
  className?: string;
  background?: "default" | "subtle" | "white";
}

export function SecondarySection({ 
  children, 
  className = "",
  background = "default"
}: SecondarySectionProps) {
  const backgrounds = {
    default: "bg-white",
    subtle: "bg-gray-50",
    white: "bg-white",
  };

  return (
    <section className={`section-secondary ${backgrounds[background]} ${className}`}>
      <div className="section-secondary-content">
        {children}
      </div>
    </section>
  );
}

interface SecondaryHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}

export function SecondaryHeader({ 
  title, 
  subtitle, 
  className = "",
  align = "left"
}: SecondaryHeaderProps) {
  return (
    <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
      <h2 className="section-secondary-title text-gray-900">
        {title}
      </h2>
      {subtitle && (
        <p className={`section-secondary-subtitle ${align === "center" ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ============================================
// TERTIARY SECTIONS - Supporting details
// ============================================

interface TertiarySectionProps {
  children: ReactNode;
  className?: string;
  background?: "default" | "subtle";
}

export function TertiarySection({ 
  children, 
  className = "",
  background = "default"
}: TertiarySectionProps) {
  const backgrounds = {
    default: "bg-white",
    subtle: "bg-gray-50",
  };

  return (
    <section className={`section-tertiary ${backgrounds[background]} ${className}`}>
      <div className="section-tertiary-content">
        {children}
      </div>
    </section>
  );
}

interface TertiaryHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function TertiaryHeader({ title, subtitle, className = "" }: TertiaryHeaderProps) {
  return (
    <div className={className}>
      <h3 className="section-tertiary-title text-gray-900">
        {title}
      </h3>
      {subtitle && (
        <p className="section-tertiary-subtitle">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ============================================
// CTA COMPONENTS - Hierarchy enforcement
// ============================================

interface PrimaryCTAProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

export function PrimaryCTA({ 
  children, 
  onClick, 
  href, 
  disabled = false,
  className = "",
  type = "button"
}: PrimaryCTAProps) {
  const baseClasses = "cta-primary";
  
  if (href) {
    return (
      <a 
        href={href}
        className={`${baseClasses} ${className}`}
      >
        {children}
      </a>
    );
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

interface SecondaryCTAProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

export function SecondaryCTA({ 
  children, 
  onClick, 
  href, 
  disabled = false,
  className = "",
  type = "button"
}: SecondaryCTAProps) {
  const baseClasses = "cta-secondary";
  
  if (href) {
    return (
      <a 
        href={href}
        className={`${baseClasses} ${className}`}
      >
        {children}
      </a>
    );
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

interface TertiaryCTAProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

export function TertiaryCTA({ 
  children, 
  onClick, 
  href, 
  disabled = false,
  className = "",
  type = "button"
}: TertiaryCTAProps) {
  const baseClasses = "cta-tertiary";
  
  if (href) {
    return (
      <a 
        href={href}
        className={`${baseClasses} ${className}`}
      >
        {children}
      </a>
    );
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

// ============================================
// CARD COMPONENTS - Hierarchy-based styling
// ============================================

interface CardProps {
  children: ReactNode;
  level?: "primary" | "secondary" | "tertiary";
  className?: string;
  onClick?: () => void;
}

export function Card({ 
  children, 
  level = "secondary",
  className = "",
  onClick
}: CardProps) {
  const levels = {
    primary: "card-primary",
    secondary: "card-secondary",
    tertiary: "card-tertiary",
  };

  const Component = onClick ? "button" : "div";
  
  return (
    <Component
      onClick={onClick}
      className={`${levels[level]} ${onClick ? "cursor-pointer hover:shadow-xl transition-all" : ""} ${className}`}
    >
      {children}
    </Component>
  );
}

// ============================================
// SPACING UTILITIES
// ============================================

export function Spacer({ size = "md" }: { size?: "xs" | "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    xs: "h-2",
    sm: "h-4",
    md: "h-8",
    lg: "h-12",
    xl: "h-16",
  };
  return <div className={sizes[size]} />;
}

export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`border-t border-gray-200 my-8 md:my-12 ${className}`}></div>
  );
}



