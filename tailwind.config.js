/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        'surface-elevated': 'hsl(var(--surface-elevated) / <alpha-value>)',
        'surface-muted': 'hsl(var(--surface-muted) / <alpha-value>)',
        'surface-strong': 'hsl(var(--surface-strong) / <alpha-value>)',
        board: {
          bg: 'hsl(var(--board-bg) / <alpha-value>)',
        },
        flap: {
          bg: 'hsl(var(--flap-bg) / <alpha-value>)',
          border: 'hsl(var(--flap-border) / <alpha-value>)',
          text: 'hsl(var(--flap-text) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        board: '0 42px 110px rgba(8, 8, 8, 0.22)',
        flap: '0 4px 10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'board-grain':
          'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.08), transparent 38%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.06), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.24))',
        'page-glow':
          'radial-gradient(circle at top, rgba(255,255,255,0.95), rgba(255,255,255,0) 45%), radial-gradient(circle at 15% 20%, rgba(15,23,42,0.04), rgba(255,255,255,0) 36%)',
      },
    },
  },
  plugins: [],
};
