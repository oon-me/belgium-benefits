/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  // Text sizes raised one step (Oct 2026): on a phone the old 12px body text and 10-11px
  // labels were too small for many readers. Every text-xs / text-sm / text-base in the app
  // follows from here, so there is one place to tune readability.
  theme: {
    extend: {
      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.35rem" }], // 14px (was 12px)
        sm: ["1rem", { lineHeight: "1.5rem" }], // 16px (was 14px)
        base: ["1.0625rem", { lineHeight: "1.65rem" }], // 17px (was 16px)
      },
    },
  },
  plugins: [],
};
