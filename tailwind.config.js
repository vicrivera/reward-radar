/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        radar: {
          bg: "#0A0B0F",
          surface: "#12131A",
          elevated: "#1A1B24",
          border: "#2A2B36",
          "border-bright": "#3A3B48",
          accent: "#00E5A0",
          "accent-dim": "#00E5A033",
          "accent-muted": "#00E5A015",
          warning: "#FFB020",
          "warning-dim": "#FFB02033",
          danger: "#FF4D6A",
          "danger-dim": "#FF4D6A33",
          info: "#4DA8FF",
          "info-dim": "#4DA8FF33",
          "text-primary": "#E8E9ED",
          "text-secondary": "#9496A1",
          "text-tertiary": "#5E6070",
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
          "0%": { boxShadow: "0 0 8px #00E5A033" },
          "100%": { boxShadow: "0 0 20px #00E5A055" },
        },
      },
    },
  },
  plugins: [],
};
