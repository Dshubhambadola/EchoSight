import { useAuth } from 'react-oidc-context';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
    const auth = useAuth();

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            auth.signinRedirect();
        }
    }, [auth.isLoading, auth.isAuthenticated, auth]);

    if (auth.isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-sky-500 animate-pulse">Authenticating...</div>
            </div>
        );
    }

    if (auth.error) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
                <div className="text-red-500 font-medium">Auth Error: {auth.error.message}</div>
                <button
                    onClick={() => {
                        void auth.removeUser();
                        void auth.signinRedirect();
                    }}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md transition-colors"
                >
                    Retry Login
                </button>
            </div>
        );
    }

    if (!auth.isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return <>{children}</>;
};
