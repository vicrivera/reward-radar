/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        radar: {
          // Backgrounds — deep navy base (Moats-aligned)
          bg: "#080B12",
          surface: "#0E1420",
          elevated: "#151C2B",
          border: "#1E2740",
          "border-bright": "#2A3654",

          // Primary accent — gold/amber (Moats brand)
          accent: "#E5A833",
          "accent-dim": "#E5A83333",
          "accent-muted": "#E5A83315",
          "accent-bright": "#F2C44D",

          // Secondary accent — blue (Moats/Avalanche)
          blue: "#3B82F6",
          "blue-dim": "#3B82F633",
          "blue-muted": "#3B82F615",

          // Semantic
          warning: "#F59E0B",
          "warning-dim": "#F59E0B33",
          danger: "#EF4444",
          "danger-dim": "#EF444433",
          info: "#3B82F6",
          "info-dim": "#3B82F633",
          success: "#10B981",
          "success-dim": "#10B98133",

          // Text
          "text-primary": "#E2E8F0",
          "text-secondary": "#94A3B8",
          "text-tertiary": "#475569",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
        "scan": "scan 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 8px #E5A83322" },
          "100%": { boxShadow: "0 0 24px #E5A83344" },
        },
        scan: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
