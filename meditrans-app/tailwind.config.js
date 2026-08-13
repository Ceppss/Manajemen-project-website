/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#2B286D",
          dark: "#211F49",
          light: "#3B3878",
        },
        status: {
          notstarted: "#D9D9D9",
          ongoing: "#F5A623",
          finished: "#2FBF71",
          overdue: "#EB5757",
          review: "#F5A623",
          approve: "#2FBF71",
          revision: "#EB5757",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 20, 43, 0.06), 0 1px 1px rgba(20,20,43,0.04)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};