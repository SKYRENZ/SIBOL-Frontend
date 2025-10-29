import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig([
  globalIgnores(['dist']),

  // Normal browser/react rules
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },

  // Node config files (postcss/tailwind/vite/etc.)
  {
    files: ['*.config.js', 'postcss.config.js', 'tailwind.config.js', 'vite.config.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        // config files are often CommonJS; set sourceType to 'script' to avoid ESM-specific checks
        sourceType: 'script',
      },
    },
    rules: {
      // allow module.exports in these files
      'no-undef': 'off',
    },
  },

  // Vite config
  {
    files: ['vite.config.js'],
    plugins: [react(), svgr()],
  },
])
