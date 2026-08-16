import { Component } from 'react'

/**
 * App-level error boundary — a render error anywhere below must never
 * white-screen the game (Phase 9 guard, applied globally instead of per-mode).
 * Offers a visible recovery path: reload the session.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-lg)',
            padding: 'var(--spacing-lg)',
            textAlign: 'center',
            fontFamily: 'var(--font-reveal)',
            color: 'var(--color-muted)',
          }}
        >
          <p style={{ maxWidth: '30rem', lineHeight: 1.7 }}>
            Something went wrong. Jane lost the thread — reload to start again.
          </p>
          <button
            type="button"
            style={{
              padding: '0.75rem 2.5rem',
              border: '1px solid var(--color-gold)',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              color: 'var(--color-gold)',
              fontFamily: 'var(--font-reveal)',
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </main>
      )
    }
    return this.props.children
  }
}
