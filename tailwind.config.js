/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F7F5F2',
        surface: '#F2F0ED',
        border: '#E8E4DF',
        border2: '#D0CBC3',
        text: '#1A1714',
        muted: '#7A746C',
        faint: '#B0AA9F',
        accent: {
          DEFAULT: '#FF5C35',
          light: '#FFF0EC',
          mid: 'rgba(255,92,53,0.15)',
        },
        violet: {
          DEFAULT: '#7C4DFF',
          light: '#F0EBFF',
        },
        teal: {
          DEFAULT: '#0EA47A',
          light: '#E6FAF4',
        },
        amber: {
          DEFAULT: '#D97706',
          light: '#FFFBEB',
        },
        li: '#0A66C2',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        md: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        lg: '0 8px 24px rgba(0,0,0,0.1), 0 3px 8px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
