import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiSummaryWidget } from './AiSummaryWidget';
import { AnalyticsService } from '../../services/analytics.service';
import { useAuth } from 'react-oidc-context';

// Mock the react-oidc-context hook
vi.mock('react-oidc-context', () => ({
    useAuth: vi.fn(),
}));

// Mock the AnalyticsService
vi.mock('../../services/analytics.service', () => ({
    AnalyticsService: {
        generateSummary: vi.fn(),
    },
}));

describe('AiSummaryWidget', () => {
    const mockUser = { access_token: 'mock-token', profile: { email: 'test@example.com' } };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({
            user: mockUser,
            isAuthenticated: true,
        });
    });

    it('renders the initial state with generate button', () => {
        render(<AiSummaryWidget dateRange="7d" />);
        expect(screen.getByText('✨ AI Insights')).toBeInTheDocument();
        expect(screen.getByText('Generate Summary')).toBeInTheDocument();
    });

    it('displays summary and hides the generate button on successful fetch', async () => {
        (AnalyticsService.generateSummary as any).mockResolvedValue('This is a mocked summary.');
        render(<AiSummaryWidget dateRange="7d" />);

        const button = screen.getByText('Generate Summary');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('This is a mocked summary.')).toBeInTheDocument();
        });
        expect(screen.queryByText('Generate Summary')).not.toBeInTheDocument();
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
    });

    it('displays upgrade prompt on 403 Forbidden error', async () => {
        const error = new Error('Forbidden');
        (error as any).response = { status: 403 };
        (AnalyticsService.generateSummary as any).mockRejectedValue(error);

        render(<AiSummaryWidget dateRange="7d" />);

        const button = screen.getByText('Generate Summary');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Pro Feature')).toBeInTheDocument();
        });
        expect(screen.getByText('You need an active EchoSight Pro subscription to use AI Summarization.')).toBeInTheDocument();
        expect(screen.getByText('Upgrade Now')).toHaveAttribute('href', '/upgrade');
    });

    it('displays generic error on non-403 failure', async () => {
        const error = new Error('Network Error');
        (AnalyticsService.generateSummary as any).mockRejectedValue(error);

        render(<AiSummaryWidget dateRange="7d" />);

        const button = screen.getByText('Generate Summary');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Failed to generate summary. Please try again.')).toBeInTheDocument();
        });
    });
});
