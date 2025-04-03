// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A6FA5',
          dark: '#3A5A8C',
          light: '#6B8CB8',
        },
        secondary: {
          DEFAULT: '#6B8F71',
          dark: '#5A7A5F',
          light: '#7FA085',
        },
        background: {
          DEFAULT: '#F5F7FA',
        },
        error: {
          DEFAULT: '#E53E3E',
        }
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'inherit',
            a: {
              color: '#4A6FA5',
              '&:hover': {
                color: '#3A5A8C',
              },
            },
            h1: {
              color: '#1A202C',
            },
            h2: {
              color: '#1A202C',
            },
            h3: {
              color: '#1A202C',
            },
            h4: {
              color: '#1A202C',
            },
            strong: {
              color: '#1A202C',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
}