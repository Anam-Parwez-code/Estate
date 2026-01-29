/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Royal Navy - Navbar aur Headings ke liye
        primary: '#0F172A', 
        // Golden Amber - Buttons aur Highlights ke liye
        accent: '#D4AF37', 
        // Soft Slate - Background ke liye
        background: '#F8FAFC', 
      },
    },
  },
  plugins: [],
};