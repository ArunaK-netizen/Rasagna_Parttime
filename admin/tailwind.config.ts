import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                outfit: ["var(--font-outfit)", "sans-serif"],
            },
            colors: {
                background: "#000000",
                surface: "#1c1c1e",
                surface2: "#2c2c2e",
                surface3: "#3a3a3c",
                border: "#38383a",
                blue: {
                    DEFAULT: "#0a84ff",
                    dim: "#007aff",
                },
                green: "#30d158",
                red: "#ff453a",
                orange: "#ff9f0a",
                yellow: "#ffd60a",
                purple: "#bf5af2",
                cyan: "#64d2ff",
                textPrimary: "#ffffff",
                textSecondary: "#98989d",
                textTertiary: "#636366",
            },
            borderRadius: {
                xl: "12px",
                "2xl": "16px",
                "3xl": "24px",
            },
        },
    },
    plugins: [],
};

export default config;
