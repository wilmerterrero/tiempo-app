/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "text-app-primary-color": "#e2e2e2",
      },
    },
  },
  daisyui: {
    themes: ["dim", "light"],
  },
  plugins: [require("daisyui")],
};
