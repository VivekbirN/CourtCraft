/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        spotify: {
          green: '#1db954',
          lightGreen: '#1ed760',
          darkBg: '#121212',
          card: '#181818',
          cardHover: '#202020',
          border: '#282828',
          borderHover: '#383838',
          subtext: '#b3b3b3'
        }
      }
    },
  },
  plugins: [],
}
