import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { ConfigModule } from '@nestjs/config';

describe('BillingService', () => {
    let service: BillingService;

    const mockStripe = {
        checkout: {
            sessions: {
                create: jest.fn().mockResolvedValue({ url: 'http://test-stripe-url.com' }),
            },
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BillingService,
                {
                    provide: 'STRIPE_CLIENT', // Assuming you might use injection token later, or mock implementation
                    useValue: mockStripe,
                }
            ],
            imports: [ConfigModule.forRoot()],
        }).compile();

        service = module.get<BillingService>(BillingService);
        // Mock the private stripe instance if not injected
        (service as any).stripe = mockStripe;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a checkout session', async () => {
        const session = await service.createCheckoutSession('user123', 'test@test.com');
        expect(session).toEqual({ url: 'http://test-stripe-url.com' });
        expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({
            success_url: expect.stringContaining('success'),
            cancel_url: expect.stringContaining('cancel'),
            mode: 'subscription',
        }));
    });
});
