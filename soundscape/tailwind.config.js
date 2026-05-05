export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#080810',
          surface:  '#10101C',
          elevated: '#181828',
          overlay:  '#1E1E32',
        },
        spotify:        '#1DB954',
        'spotify-dim':  '#158A3E',
        accent: {
          purple: '#9D6FFF',
          amber:  '#F59E0B',
          cyan:   '#22D3EE',
          rose:   '#FB7185',
        },
        text: {
          primary:   '#F0F0FF',
          secondary: '#8888AA',
          muted:     '#44445A',
        },
      },
      fontFamily: {
        display: ['Clash Display', 'sans-serif'],
        body:    ['Satoshi', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        shimmer:     'shimmer 1.5s infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '-100% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(29,185,84,0.15)' },
          '50%':      { boxShadow: '0 0 40px rgba(29,185,84,0.35)' },
        },
      },
    },
  },
  plugins: [],
}
