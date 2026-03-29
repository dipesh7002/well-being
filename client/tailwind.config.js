/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 24px 60px rgba(190, 99, 31, 0.12)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      fontFamily: {
        body: ['"Plus Jakarta Sans"', "sans-serif"],
        display: ['"Fraunces"', "serif"]
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(255, 181, 103, 0.35), transparent 45%), radial-gradient(circle at bottom right, rgba(247, 115, 167, 0.22), transparent 45%)"
      }
    }
  },
  plugins: []
};

