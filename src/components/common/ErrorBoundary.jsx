import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Admin Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-white p-8 text-center space-y-4">
          <div className="text-4xl">😵</div>
          <h2 className="text-xl font-bold font-heading text-red-400">Oups, une erreur est survenue !</h2>
          <p className="text-gray-400 max-w-md">
            Une "anomalie" technique a été détectée. Pas de panique, le reste du site fonctionne.
          </p>
          <div className="bg-red-900/20 p-4 rounded border border-red-900/50 text-left w-full max-w-lg overflow-auto">
            <code className="text-xs text-red-300 font-mono">
              {this.state.error && this.state.error.toString()}
            </code>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#d4af37] text-black font-bold rounded hover:bg-yellow-500 transition"
          >
            Recharger la page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
