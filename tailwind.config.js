const token = (nombre) => `rgb(var(--${nombre}) / <alpha-value>)`;

export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        line: token('line'),
        fg: token('fg'),
        muted: token('muted'),
        brand: token('brand'),
        'on-brand': token('on-brand'),
        ok: token('ok'),
        warn: token('warn'),
        bad: token('bad'),
        promise: token('promise'),
        director: token('a-director'),
        analista: token('a-analista'),
        redactor: token('a-redactor'),
        negociador: token('a-negociador'),
      },
      fontFamily: {
        sans: ['Geist', 'Inter Tight', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
