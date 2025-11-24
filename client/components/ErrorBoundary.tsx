import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-screen w-screen bg-space-void text-space-cyan font-mono">
                    <div className="p-8 border border-space-cyan/30 bg-space-void/90 backdrop-blur-md max-w-2xl">
                        <h1 className="text-2xl font-bold mb-4 text-space-magenta">SYSTEM FAILURE</h1>
                        <p className="mb-4">An unexpected error occurred in the visualization.</p>
                        <pre className="bg-black/50 p-4 rounded text-xs overflow-auto max-h-64 text-space-cyan/70">
                            {this.state.error?.toString()}
                        </pre>
                        <button
                            className="mt-6 px-4 py-2 bg-space-cyan/20 hover:bg-space-cyan/40 text-space-cyan border border-space-cyan transition-colors"
                            onClick={() => window.location.reload()}
                        >
                            REBOOT SYSTEM
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
