'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  name: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[SectionErrorBoundary: ${this.props.name}]`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Graceful fallback - show minimal section instead of crash
      return (
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-400 text-sm">
              Bagian ini sedang dimuat...
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 text-mitsu-red text-xs font-semibold hover:underline"
            >
              Muat Ulang Bagian Ini
            </button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
