import { Component, type ReactNode } from 'react'

export interface ModelErrorBoundaryProps {
  /** Shown in place of the model if loading throws — the exhibit's existing sculptural placeholder. */
  fallback: ReactNode
  children: ReactNode
}

interface ModelErrorBoundaryState {
  hasError: boolean
}

/**
 * Catches a failed GLB/GLTF load (missing file, bad network, malformed
 * asset) and swaps in the exhibit's placeholder instead of letting the
 * error propagate past Suspense and take down the whole Canvas.
 *
 * `useGLTF` throws synchronously during render — a promise while loading
 * (caught by the surrounding `<Suspense>`), a real `Error` if the load
 * fails (caught here) — so a class component error boundary is the only
 * mechanism that can intercept it; hooks can't catch render-phase errors.
 */
export class ModelErrorBoundary extends Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
  state: ModelErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ModelErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown): void {
    console.warn('[MYTHOS] Exhibit model failed to load — showing the placeholder instead.', error)
  }

  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
