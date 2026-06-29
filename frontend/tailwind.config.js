/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        /** Between base and sm — tighter search bar can relax slightly here */
        xs: '380px',
        /** Desktop navbar — hamburger below this width (fits full link row + actions) */
        nav: '1922px',
      },
      colors: {
        navy: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E5C663',
        },
        gray: {
          light: '#E5E7EB',
          DEFAULT: '#4B5563',
          dark: '#1E293B',
          darker: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        times: ['"Times New Roman"', 'Times', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
