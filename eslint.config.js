/**
 * ESLint flat config (ESLint 9)
 *
 * - @eslint/js recommended — core rules (no-undef, no-unused-vars, ...)
 * - eslint-plugin-react recommended — JSX-aware rules
 * - eslint-plugin-react-hooks recommended — rules-of-hooks, exhaustive-deps
 * - jsx-runtime overrides — react-in-jsx-scope / jsx-uses-react off, because
 *   Vite uses the automatic JSX runtime (React is never imported in scope)
 * - react/prop-types off — plan Phase 13 allows inline JSDoc in place of PropTypes
 */

import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      // Intentional empty catches (e.g. localStorage unavailable) are allowed
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
]
