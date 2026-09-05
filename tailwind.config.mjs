/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cream: '#f4ead9',
        'deep-brown': '#241a13',
        'deep-brown-dark': '#1a120d',
        'dark-text': '#2c2016',
        'dark-text-secondary': '#4a3c2c',
        gold: '#b98a3e',
        'gold-light': '#d1a55e',
        'muted-green': '#445c3c',
        'cream-accent': '#e9dcc4',
        'brown-light': '#c9b998',
        'brown-lighter': '#cbb99a',
        'brown-muted': '#6b5c48',
        'brown-pale': '#8a7a63',
        'brown-dull': '#a8977c',
      },
      fontFamily: {
        serif: ['EB Garamond', 'serif'],
        sans: ['Work Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
