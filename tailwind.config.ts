import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        field: "#F4F7FB",
        line: "#D9E1EC",
        pitch: "#0F7A5B",
        gold: "#C9A227",
        coral: "#D75A4A"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 32, 51, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
