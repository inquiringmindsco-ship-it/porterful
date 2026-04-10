'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class AudioErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[AUDIO ERROR BOUNDARY]', error.message, errorInfo)
    if (typeof window !== 'undefined') {
      (window as any).__renderErrors = (window as any).__renderErrors || []
      ;(window as any).__renderErrors.push({
        error: error.message,
        info: errorInfo,
        time: Date.now(),
      })
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div style={{ display: 'none' }} aria-hidden="true" />
      )
    }
    return this.props.children
  }
}
