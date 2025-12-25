"use client";

import { useMemo } from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dark-bg" | "light-bg";
}

export default function Logo({ className = "", size = "md", variant = "default" }: LogoProps) {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-3xl md:text-4xl",
    lg: "text-4xl md:text-5xl",
    xl: "text-5xl md:text-6xl lg:text-7xl",
  };

  const glowStyles = useMemo(() => {
    if (variant === "dark-bg") {
      return {
        white: {
          textShadow: `
            0 0 8px rgba(255, 255, 255, 0.6),
            0 0 12px rgba(255, 255, 255, 0.4)
          `,
          color: '#ffffff',
        },
        price: {
          color: '#ffffff',
        },
        cent: {
          textShadow: `
            0 0 8px rgba(250, 204, 21, 0.8),
            0 0 12px rgba(250, 204, 21, 0.6)
          `,
          color: '#facc15', // yellow-400
        },
      };
    }
    // Light background - dark text for visibility
    return {
      white: {
        textShadow: `
          0 0 2px rgba(0, 0, 0, 0.1)
        `,
        color: '#1e293b', // slate-800 - dark gray for readability
      },
      price: {
        textShadow: `
          0 0 2px rgba(0, 0, 0, 0.1)
        `,
        color: '#1e293b', // slate-800 - dark gray for readability
      },
      cent: {
        textShadow: `
          0 0 4px rgba(234, 179, 8, 0.6),
          0 0 8px rgba(234, 179, 8, 0.4)
        `,
        color: '#eab308', // yellow-500 - gold
      },
    };
  }, [variant]);

  const isInline = className.includes("inline");
  const Container = isInline ? "span" : "div";

  return (
    <Container className={`font-bold ${sizeClasses[size]} ${className} select-none ${isInline ? "inline-block" : ""}`}>
      <span className="relative inline-block" style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}>
        {/* COMFY - White */}
        <span 
          className="relative inline-block"
          style={{
            ...glowStyles.white,
            color: glowStyles.white.color,
            letterSpacing: '0.05em',
            fontFamily: '"Times New Roman", "Georgia", serif',
            fontWeight: 900,
            textTransform: 'uppercase',
            lineHeight: '1.1',
            WebkitFontSmoothing: 'antialiased',
            textRendering: 'optimizeLegibility',
          }}
        >
          COMFY
        </span>
        
        {/* pri¢e - White price, gold cent */}
        <span 
          className="relative ml-0 inline-block"
          style={{
            ...glowStyles.price,
            color: glowStyles.price.color,
            letterSpacing: '0.02em',
            fontFamily: '"Times New Roman", "Georgia", serif',
            fontWeight: 900,
            textTransform: 'lowercase',
            lineHeight: '1.1',
            WebkitFontSmoothing: 'antialiased',
            textRendering: 'optimizeLegibility',
          }}
        >
          pri<span 
            className="inline align-baseline" 
            style={{ 
              fontSize: 'inherit', 
              lineHeight: 'inherit',
              ...glowStyles.cent,
              color: glowStyles.cent.color,
            }}
          >¢</span>e
        </span>
      </span>
    </Container>
  );
}
