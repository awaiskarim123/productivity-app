import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./src/lib/**/*.{svelte,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [forms],
}
