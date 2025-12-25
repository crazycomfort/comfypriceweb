"use client";

import { useState, useId } from "react";

interface HelpTooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export default function HelpTooltip({ content, position = "top", className = "" }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent",
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Help"
        aria-describedby={tooltipId}
        aria-expanded={isVisible}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {isVisible && (
        <div
          id={tooltipId}
          className={`absolute z-50 ${positionClasses[position]} w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-xl`}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          <p className="leading-relaxed">{content}</p>
          <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

