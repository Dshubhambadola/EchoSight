import type { AuthProviderProps } from 'react-oidc-context';

export const authConfig: AuthProviderProps = {
    authority: 'http://localhost:8080/realms/echosight',
    client_id: 'echosight-frontend',
    redirect_uri: window.location.origin,
    onSigninCallback: () => {
        window.history.replaceState({}, document.title, window.location.pathname);
    },
};
