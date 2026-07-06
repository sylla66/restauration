/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#e67e22", hover: "#d35400" },
        secondary: { DEFAULT: "#2ecc71", hover: "#27ae60" },
      },
    },
  },
  plugins: [],
};
