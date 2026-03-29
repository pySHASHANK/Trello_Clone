/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Trello uses system fonts primarily
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Noto Sans', 'Ubuntu', 'sans-serif'],
      },
      colors: {
        trello: {
          blue: '#0079bf',
          darkBlue: '#026aa7',
          nav: '#004d84',
          list: '#f1f2f4',
          textDark: '#172b4d',
          textLight: '#44546f',
          buttonHover: '#091e4214',
          cardHover: '#f4f5f7'
        }
      },
      boxShadow: {
        'card': '0px 1px 1px #091e4240, 0px 0px 1px #091e424f',
        'card-hover': '0px 1px 1px #091e4240, 0px 0px 1px #091e424f',
      }
    },
  },
  plugins: [],
}
