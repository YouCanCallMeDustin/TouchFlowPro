import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Check for chunk load error (usually happens when a new version is deployed and old chunks are gone)
        const isChunkError = error.message && (
            error.message.includes('Failed to fetch dynamically imported module') ||
            error.message.includes('ChunkLoadError') ||
            error.message.includes('failed to fetch dynamically imported module')
        );

        if (isChunkError) {
            // Check if we already tried reloading in this session to prevent infinite reload loops
            const hasReloaded = sessionStorage.getItem('tfp_chunk_error_reload');
            if (!hasReloaded) {
                sessionStorage.setItem('tfp_chunk_error_reload', 'true');
                console.warn('Chunk load error detected. Attempting automatic reload to fetch latest version...');
                window.location.reload();
                return;
            }
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-bg-main flex items-center justify-center p-6">
                    <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center border border-slate-100">
                        <div className="text-6xl mb-6">⚠️</div>
                        <h2 className="text-3xl font-black text-text-main mb-4">
                            Oops! Something went wrong
                        </h2>
                        <p className="text-text-muted mb-8 leading-relaxed">
                            We encountered an unexpected error. Don't worry, your progress is saved.
                        </p>
                        <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left">
                            <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                                Error Details
                            </div>
                            <div className="text-sm font-mono text-red-600">
                                {this.state.error?.message || 'Unknown error'}
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 bg-primary-blue text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
