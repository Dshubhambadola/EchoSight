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
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500">
                Auth Error: {auth.error.message}
            </div>
        );
    }

    if (!auth.isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return <>{children}</>;
};
