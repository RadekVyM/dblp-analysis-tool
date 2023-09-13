/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './shared/styling/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    {
      pattern: /(bg|text|fill|stroke)-(books-and-theses|journal-articles|conference-and-workshop-papers|parts-in-books-or-collections|editorship|reference-works|data-and-artifacts|informal-and-other)/,
      variants: ['hover', 'before', 'after'],
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'on-primary': 'var(--on-primary)',
        secondary: 'var(--secondary)',
        'on-secondary': 'var(--on-secondary)',
        'secondary-dim': 'var(--secondary-dim)',
        'on-secondary-dim': 'var(--on-secondary-dim)',

        surface: 'var(--surface)',
        'on-surface': 'var(--on-surface)',
        'on-surface-muted': 'var(--on-surface-muted)',

        'surface-dim': 'var(--surface-dim)',
        'on-surface-dim': 'var(--on-surface-dim)',
        'on-surface-dim-muted': 'var(--on-surface-dim-muted)',

        'surface-container': 'var(--surface-container)',
        'on-surface-container': 'var(--on-surface-container)',
        'on-surface-container-muted': 'var(--on-surface-container-muted)',

        'surface-dim-container': 'var(--surface-dim-container)',
        'on-surface-dim-container': 'var(--on-surface-dim-container)',
        'on-surface-dim-container-muted': 'var(--on-surface-dim-container-muted)',

        outline: 'var(--outline)',
        'outline-variant': 'var(--outline-variant)',

        danger: 'var(--danger)',
        'on-danger': 'var(--on-danger)',
        'danger-dim': 'var(--danger-dim)',
        'on-danger-dim': 'var(--on-danger-dim)',

        backdrop: 'var(--backdrop)',

        'books-and-theses': 'var(--books-and-theses)',
        'journal-articles': 'var(--journal-articles)',
        'conference-and-workshop-papers': 'var(--conference-and-workshop-papers)',
        'parts-in-books-or-collections': 'var(--parts-in-books-or-collections)',
        'editorship': 'var(--editorship)',
        'reference-works': 'var(--reference-works)',
        'data-and-artifacts': 'var(--data-and-artifacts)',
        'informal-and-other': 'var(--informal-and-other)',
      },
      screens: {
        'xs': '400px'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        slideUpIn: {
          '0%': { transform: 'translateY(50%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideLeftIn: {
          '0%': { transform: 'translateX(50%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        slideDownOut: {
          '0%': { transform: 'translateY(0)', opacity: 1 },
          '100%': { transform: 'translateY(50%)', opacity: 0 },
        },
        slideRightOut: {
          '0%': { transform: 'translateX(0)', opacity: 1 },
          '100%': { transform: 'translateX(50%)', opacity: 0 },
        }
      },
      animation: {
        fadeIn: 'fadeIn 150ms ease-in-out forwards',
        fadeOut: 'fadeOut 150ms ease-in-out forwards',
        slideUpIn: 'slideUpIn 150ms ease-in-out forwards',
        slideLeftIn: 'slideLeftIn 150ms ease-in-out forwards',
        slideDownOut: 'slideDownOut 150ms ease-in-out forwards',
        slideRightOut: 'slideRightOut 150ms ease-in-out forwards',
      }
    },
  },
  plugins: [
    require('@tailwindcss/container-queries')
  ],
}
