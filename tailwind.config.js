/** @type {import('tailwindcss').Config} */

// Rediseño 2026 · "Lima eléctrico"
// - gray / slate: grafito neutro (antes gris azulado)
// - primary / blue / indigo: escala lima de marca.
//   300 = #C8F23A (lima eléctrico, el acento de la landing)
//   600/700 = verdes oscuros que se leen bien con texto blanco
const graphite = {
  50: '#F6F7F3',
  100: '#EEF0EA',
  200: '#DFE2DA',
  300: '#C6CAC1',
  400: '#9CA299',
  500: '#687068',
  600: '#4C534D',
  700: '#363B37',
  800: '#1F2320',
  900: '#151816',
  950: '#0B0C0B',
}
const brand = {
  50: '#F7FEE7',
  100: '#ECFCCB',
  200: '#D9F99D',
  300: '#C8F23A',
  400: '#A3E635',
  500: '#65A30D',
  600: '#4D7C0F',
  700: '#3F6212',
  800: '#365314',
  900: '#1A2E05',
  950: '#0F1A03',
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: graphite,
        slate: graphite,
        primary: brand,
        blue: brand,
        indigo: brand,
        lime: { ...brand, 500: '#84CC16' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
