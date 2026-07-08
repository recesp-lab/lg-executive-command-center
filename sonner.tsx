import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Dashboard error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center bg-white">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Algo deu errado</h1>
            <p className="text-muted-foreground mb-4">Recarregue a página para tentar novamente.</p>
            <button
              className="px-4 py-2 rounded-lg bg-primary text-white font-semibold"
              onClick={() => window.location.reload()}
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
