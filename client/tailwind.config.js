/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF6B35",
          red: "#E8533F",
          green: "#2DC653",
          purple: "#7B61FF",
          blue: "#00B4D8",
          dark: "#0A0A0F",
          card: "#12121A",
          border: "#1E1E28",
        },
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
