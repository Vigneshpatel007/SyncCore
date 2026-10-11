import { Component } from 'react';

/** Error boundary: if any child component crashes while rendering, show a friendly message instead of a blank page. */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() { return { hasError: true }; }

  componentDidCatch(error, info) { console.error('UI crash:', error, info); }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="boundary">
        <h2>This page ran into a problem</h2>
        <p>Your data is safe. Reload the page to continue.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload page</button>
      </div>
    );
  }
}
