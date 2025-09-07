/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2C3E50',
        'secondary': '#3498DB',
        'accent': '#E74C3C',
        'background': '#1A202C',
        'card-border': {
          'common': '#95A5A6',
          'uncommon': '#3498DB',
          'rare': '#9B59B6',
          'epic': '#E74C3C',
          'legendary': '#F1C40F',
          'mythic': '#B83280',    // Hot pink/magenta
          'unique': '#00FFFF',    // Cyan
        },
        'element': {
          'aurora': '#8B5CF6',
          'void': '#1E1E1E',
          'crystal': '#D53F8C',
          'blood': '#881337',
          'storm': '#FBBF24',
          'flora': '#059669',
          'aether': '#6366F1',
        }
      },
      fontFamily: {
        'title': ['Cinzel', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
      animation: {
        'card-hover': 'card-lift 0.3s ease forwards',
        'card-glow': 'card-glow 2s infinite alternate',
      },
      keyframes: {
        'card-lift': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-10px)' },
        },
        'card-glow': {
          '0%': { boxShadow: '0 0 5px rgba(66, 153, 225, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(66, 153, 225, 0.8)' },
        },
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'mythic': '0 0 15px rgba(184, 50, 128, 0.6)',
        'unique': '0 0 15px rgba(0, 255, 255, 0.6)'
      }
    },
  },
  plugins: [],
}
