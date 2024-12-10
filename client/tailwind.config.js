import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        "yellow-bright": {
          extend: "dark",
          colors: {
            foreground: "#ffffff",
            chatbotPrimary: "#629584",
            primary: {
              50: "#4F6700",
              100: "#698200",
              200: "#869C00",
              300: "#A3B600",
              400: "#C2D100",
              500: "#DEFF00",
              600: "#E8FF4D",
              700: "#F2FF80",
              800: "#F9FFB3",
              900: "#FCFFDA",
              DEFAULT: "#DEFF00",
              foreground: "#000000",
            },
            focus: "#E8FF4D",
          },
        },
      },
    }),
  ],
};
