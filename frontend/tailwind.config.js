/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#e67e22", hover: "#d35400" },
        secondary: { DEFAULT: "#2ecc71", hover: "#27ae60" },
        dark: {
          bg: "#0f0f23",
          card: "#1a1a3e",
          border: "#2d2d5e",
          hover: "#252550",
        },
      },
    },
  },
  plugins: [],
};
