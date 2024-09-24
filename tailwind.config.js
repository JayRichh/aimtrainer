/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        sm: '4px',
      }
    }
  },
  variants: {
    extend: {
      scale: ['hover', 'focus'],
    }
  },
  plugins: [],
}
