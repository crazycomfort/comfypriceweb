import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
        },
        accent: {
          400: "var(--accent-400)",
          500: "var(--accent-500)",
          600: "var(--accent-600)",
        },
        secondary: {
          300: "var(--secondary-300)",
          400: "var(--secondary-400)",
          500: "var(--secondary-500)",
        },
        tertiary: {
          400: "var(--tertiary-400)",
          500: "var(--tertiary-500)",
          600: "var(--tertiary-600)",
        },
        neutral: {
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
          600: "var(--neutral-600)",
          700: "var(--neutral-700)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",
        },
        success: "var(--success)",
        "success-light": "var(--success-light)",
        warning: "var(--warning)",
        "warning-light": "var(--warning-light)",
        error: "var(--error)",
        "error-light": "var(--error-light)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;

