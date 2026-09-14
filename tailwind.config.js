/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      colors: {
        brand: {
          // NOTE: the key is still "green" (kept so every existing
          // bg-brand-green / text-brand-green / border-brand-green class
          // across the codebase updates automatically) but the colour
          // itself is now a deep wine/burgundy — the "classy bold" accent
          // requested to replace the old forest green, paired with the
          // gold accent for an elegant, Italian-restaurant-style look.
          green: "#393026",
          gold: "#5a4b3f",
          orange: "#bb7f3b",
          cream: "#f6f2e9",
        },
        // Admin's own palette — deliberately decoupled from the customer
        // "brand" colors above, so a future customer rebrand (like this one)
        // never accidentally reskins the dashboard too.
        admin: {
          navy: "#367588",
          accent: "#c9a24a",
        },
      },
    },
  },
  plugins: [],
};
