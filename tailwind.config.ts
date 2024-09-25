import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      backdropBlur: {
        sm: '4px',
      },
    },
  },
  variants: {
    extend: {
      scale: ['hover', 'focus'],
    },
    scrollbar: ['rounded'],
  },
  plugins: [require('tailwind-scrollbar')],
};

export default config;
