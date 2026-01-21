import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // IRA Racing Theme - F1 inspired
        ira: {
          // Primary - Racing Red
          red: {
            DEFAULT: "#E10600",
            50: "#FFF1F0",
            100: "#FFE0DE",
            200: "#FFC2BE",
            300: "#FF9490",
            400: "#FF5A52",
            500: "#E10600",
            600: "#C40500",
            700: "#9A0400",
            800: "#6B0300",
            900: "#4A0200",
          },
          // Secondary - Carbon Black
          carbon: {
            DEFAULT: "#15151E",
            50: "#F8F8FA",
            100: "#E8E8EE",
            200: "#D1D1DC",
            300: "#A8A8B8",
            400: "#6E6E82",
            500: "#3D3D4D",
            600: "#2A2A36",
            700: "#1F1F28",
            800: "#15151E",
            900: "#0A0A0F",
          },
          // Accent - Championship Gold
          gold: {
            DEFAULT: "#FFD700",
            50: "#FFFEF0",
            100: "#FFFBD6",
            200: "#FFF5AD",
            300: "#FFED7A",
            400: "#FFE247",
            500: "#FFD700",
            600: "#D4B300",
            700: "#998000",
            800: "#665600",
            900: "#332B00",
          },
          // Status colors
          success: "#00D26A",
          warning: "#FFAA00", 
          danger: "#FF3B3B",
          info: "#3B82F6",
        },
        // Speed heatmap colors
        speed: {
          slow: "#22C55E",     // Green - braking zones
          medium: "#F59E0B",   // Yellow/Orange - transition
          fast: "#EF4444",     // Red - full throttle
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        racing: ["var(--font-racing)", "Impact", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "carbon-fiber": `repeating-linear-gradient(
          45deg,
          #15151E 0px,
          #15151E 2px,
          #1F1F28 2px,
          #1F1F28 4px
        )`,
        "racing-stripe": "linear-gradient(90deg, transparent 0%, transparent 45%, #E10600 45%, #E10600 55%, transparent 55%, transparent 100%)",
      },
      boxShadow: {
        "ira": "0 4px 20px -4px rgba(225, 6, 0, 0.3)",
        "ira-lg": "0 8px 40px -8px rgba(225, 6, 0, 0.4)",
        "gold": "0 4px 20px -4px rgba(255, 215, 0, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}

export default config
