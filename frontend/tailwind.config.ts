import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-dark": "var(--brand-dark)",
        "deep-black": "var(--deep-black)",
        "off-black": "var(--off-black)",
        "brand-pink": "var(--brand-pink)",
        "accent-orange": "var(--accent-orange)",
        "sky-blue": "var(--sky-blue)",
        cream: "var(--cream)",
        "muted-text": "var(--muted-text)",
        "muted-taupe": "var(--muted-taupe)",
        "surface-input": "var(--surface-input)",
        "border-dark": "var(--border-dark)",
        "admin-bg": "var(--admin-bg)",
        "admin-deep": "var(--admin-deep-black)",
        "admin-off": "var(--admin-off-black)",
        "admin-pink": "var(--admin-pink)",
        "admin-muted": "var(--admin-muted-text)",
        "admin-surface-low": "var(--admin-surface-low)",
        "admin-border": "var(--admin-border-dark)",
        "admin-cream": "var(--admin-cream)",
        
        // Assessment Theme Mapping
        "primary": "var(--brand-pink)",
        "secondary": "var(--accent-orange)",
        "surface-container": "var(--surface-container)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-highest": "var(--surface-container-highest)",
        "primary-container": "var(--primary-container)",
        "on-primary-container": "var(--on-primary-container)",
        "outline-variant": "var(--outline-variant)",
        "success": "var(--success)",
        "warning": "var(--warning)",
        "error": "var(--error)",
      },
      fontFamily: {
        serif: ["var(--font-quicksand)", "sans-serif"],
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "6px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        l1: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
        l2: "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)",
        l3: "0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)",
        l4: "0px 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
