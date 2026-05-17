import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application recovery boundary caught an error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="screen">
          <section className="empty-state">
            <p className="eyebrow">Recovery mode</p>
            <h2>Something went wrong</h2>
            <p>The incident workspace hit an unexpected issue. Refresh the page to reload the local demo data.</p>
            <button className="primary-action" onClick={() => window.location.reload()} type="button">
              Reload workspace
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
