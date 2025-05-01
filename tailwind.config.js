/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  safelist: [
    'dark',
    'light',
    'dark:bg-gray-900',
    'bg-white',
    'dark:text-white',
    'text-black'
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          light: '#f8fafc',
          dark: '#1e293b',
        },
        content: {
          light: '#ffffff',
          dark: '#0f172a',
        },
      },
    },
  },
  plugins: [],
} 