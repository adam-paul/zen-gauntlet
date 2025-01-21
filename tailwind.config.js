// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'zen': {
            bg: '#E8E3D5',
            primary: '#683A3A',
            secondary: '#4A3434',
            border: '#D4C5C5',
            hover: '#4A2A2A',
          },
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  }
  