/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Avoiding purple, using a clean monochrome + accent color (maybe a cool blue or green)
        primary: '#111111',
        secondary: '#f5f5f5',
        accent: '#00ff41', // Matrix green or maybe a cool blue? Let's go with a sharp cyan/blue
        highlight: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
