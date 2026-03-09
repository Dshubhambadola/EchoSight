import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';

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
                },
                {
                    provide: getRepositoryToken(Subscription),
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(null),
                        create: jest.fn().mockReturnValue({}),
                        save: jest.fn().mockResolvedValue({}),
                    },
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
            success_url: expect.stringContaining('analytics?session_id={CHECKOUT_SESSION_ID}'),
            cancel_url: expect.stringContaining('settings'),
            mode: 'payment',
            client_reference_id: 'user123',
            customer_email: 'test@test.com'
        }));
    });
});
