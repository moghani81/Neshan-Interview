/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        jump: "jump 1.4s infinite",
      },
      keyframes: {
        jump: {
          "0%, 40%, 100%": { transform: "translateY(0)" },
          "20%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
