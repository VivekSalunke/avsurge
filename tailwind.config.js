/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: '#0a0a0c', // deep slate / pitch black
        'neon-violet': '#8b5cf6',
        'neon-cyan': '#06b6d4',
        'cyber-muted': '#0f1720',
        'cyber-ink': '#050507',
        'cyber-acc': '#1e293b'
      },
      boxShadow: {
        glow: '0 8px 30px rgba(139,92,246,0.18), 0 0 28px rgba(6,182,212,0.06)',
        'neon-sm': '0 4px 18px rgba(139,92,246,0.12)',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
}
