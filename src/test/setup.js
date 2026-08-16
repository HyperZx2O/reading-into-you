import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom 29 under vitest 4.1 surfaces `localStorage` as an empty object with no
// Storage methods. Provide a working in-memory Storage so the sound-preference
// persistence is testable (also gives clean per-environment isolation).
function createStorageShim() {
  const store = new Map()
  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key) {
      const k = String(key)
      return store.has(k) ? store.get(k) : null
    },
    key(index) {
      return [...store.keys()][index] ?? null
    },
    removeItem(key) {
      store.delete(String(key))
    },
    setItem(key, value) {
      store.set(String(key), String(value))
    },
  }
}

if (typeof window !== 'undefined' && typeof window.localStorage?.setItem !== 'function') {
  const shim = createStorageShim()
  Object.defineProperty(window, 'localStorage', { configurable: true, value: shim })
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: shim })
}

// jsdom lacks matchMedia — the app reads it for reduced-motion behavior.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// jsdom's HTMLMediaElement cannot actually play audio; AudioToggle creates an
// <audio> element and calls play()/pause() on it.
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: vi.fn(() => Promise.resolve()),
})
Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: vi.fn(),
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  // Preference state must not leak between tests in the same worker.
  localStorage.clear()
})
