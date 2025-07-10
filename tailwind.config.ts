/** @type {import('tailwindcss').Config} */
import plugin from "tailwindcss/plugin";

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enables dark mode with the 'dark' class
  safelist: [
    "btn-light",
    "input-base",
    // Add other custom classes if needed
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        romantic: {
          50: "#fef7f7",
          100: "#fef0f0",
          200: "#fde2e2",
          300: "#fbc5c5",
          400: "#f79a9a",
          500: "#f06969",
          600: "#e53e3e",
          700: "#c53030",
          800: "#9b2c2c",
          900: "#742a2a",
        },
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        dancing: ["Dancing Script", "serif"],
        lora: ["Lora", "serif"],
        playfair: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents, theme }) {
      addComponents({
        // Custom btn-light utility
        ".btn-light": {
          backgroundColor:
            "color-mix(in srgb, rgb(253 242 248) 50%, transparent)",
          color: "rgb(55 65 81)",
          border:
            "1px solid color-mix(in srgb, rgb(251 207 232) 40%, transparent)",
          transitionProperty: "all, transform",
          transitionDuration: "200ms",
          transitionTimingFunction: "ease-out",
          "&:hover": {
            backgroundColor:
              "color-mix(in srgb, rgb(252 231 243) 70%, transparent)",
            color: "rgb(31 41 55)",
            borderColor:
              "color-mix(in srgb, rgb(244 114 182) 60%, transparent)",
            transform: "scale(1.05)",
          },
          ".dark &": {
            backgroundColor:
              "color-mix(in srgb, rgb(15 23 42) 50%, transparent)",
            color: "rgb(252 231 243)",
            border:
              "1px solid color-mix(in srgb, rgb(157 23 77) 40%, transparent)",
            "&:hover": {
              backgroundColor:
                "color-mix(in srgb, rgb(131 24 67) 40%, transparent)",
              color: "rgb(251 207 232)",
              borderColor:
                "color-mix(in srgb, rgb(219 39 119) 60%, transparent)",
              transform: "scale(1.05)",
            },
          },
        },
        // Custom input-base utility
        ".input-base": {
          backgroundColor: theme("colors.white"),
          borderColor: theme("colors.pink.400"),
          color: theme("colors.gray.800"),
          transitionProperty: "all",
          transitionDuration: "200ms",
          transitionTimingFunction: "ease-out",
          "&:focus": {
            outline: "none",
            ringColor: theme("colors.pink.500"),
            ringWidth: "2px",
            ringOffsetWidth: "2px",
          },
          ".dark &": {
            backgroundColor: theme("colors.gray.800"),
            borderColor: theme("colors.pink.600"),
            color: theme("colors.gray.200"),
            "&:focus": {
              ringColor: theme("colors.pink.500"),
            },
          },
        },
      });
    }),
  ],
};
