import formPlugin from '@tailwindcss/forms'
import type { Config } from 'tailwindcss'

import multiThemePlugin from './utils/multiThemePlugin'
import theme from './utils/theme.json'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [multiThemePlugin({colorThemes: theme}), formPlugin],
} satisfies Config
