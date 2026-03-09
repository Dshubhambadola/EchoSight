import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('Attempts to authenticate and fetch OIDC configuration from Keycloak', async ({ page }) => {
        // We want to intercept the OIDC configuration request that react-oidc-context makes
        let oidcRequestMade = false;

        await page.route('**/*/.well-known/openid-configuration', route => {
            oidcRequestMade = true;
            route.abort(); // We just want to know it tried, simulate Keycloak being unreachable or offline for testing
        });

        // Go to the main dashboard
        await page.goto('/', { waitUntil: 'commit' });

        // Ensure the loading state or the request was fired
        await expect(page.locator('body')).toContainText('Authenticating...');

        // Or we expect the boolean flag to be true
        expect(oidcRequestMade).toBe(true);
    });
});
