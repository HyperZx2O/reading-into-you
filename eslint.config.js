// ponytail: minimal flat config so `npm run lint` can run — no lint config was
// committed in the scaffold. No new dependencies (plugins already in devDeps).
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  { ignores: ['dist'] },
  js.configs.recommended,
  react.configs.flat.recommended,
  reactHooks.configs['recommended-latest'],
  {
    languageOptions: { globals: globals.browser },
    settings: { react: { version: '18.3' } },
    rules: {
      'react/react-in-jsx-scope': 'off', // new JSX transform
      'react/prop-types': 'off', // this project is untyped JS by design
      // Global allowEmptyCatch rather than scoping it to App.jsx (Person A's
      // file) — the intentional `catch {}` guards there use it.
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
]
