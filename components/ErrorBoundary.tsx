import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  isChunkError: boolean;
  error?: Error | null;
  info?: React.ErrorInfo | null;
}

function isChunkLoadError(error: Error): boolean {
  const msg = (error.message ?? '').toLowerCase();
  return (
    error.name === 'ChunkLoadError' ||
    msg.includes('dynamically imported module') ||
    msg.includes('loading chunk') ||
    msg.includes('loading css chunk') ||
    msg.includes('importing a module script failed') ||
    // Firefox: 'error loading dynamically imported module'
    // Chrome:  'failed to fetch dynamically imported module: URL'
    // Safari:  'importing a module script failed'
    (error instanceof TypeError && msg.includes('module'))
  );
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, isChunkError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, isChunkError: isChunkLoadError(error), error, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ info });
    console.error('ErrorBoundary caught an error:', error, info);

    // Chunk load errors mean the deployed build changed — force a full reload
    // to pick up the new index.html and chunk hashes.
    if (isChunkLoadError(error)) {
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isChunkError) {
        return (
          <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
            <p style={{ color: '#555' }}>A new version was deployed. Reloading&hellip;</p>
          </div>
        );
      }

      return (
        <div style={{ padding: 24, fontFamily: 'Inter, sans-serif' }}>
          <h2 style={{ color: '#9b1c1c' }}>An application error occurred</h2>
          <p style={{ color: '#444' }}>The app encountered a runtime error while rendering. The details are shown below.</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#111827', color: '#f8fafc', padding: 12, borderRadius: 6, overflow: 'auto' }}>
            {this.state.error?.message}
            {this.state.info ? `\n\nComponent Stack:\n${this.state.info.componentStack}` : ''}
          </pre>
          <p style={{ color: '#444' }}>Open the browser console or check the terminal for more details.</p>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

