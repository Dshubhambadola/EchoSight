import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SentimentHistory } from './sentiment-history.entity';

describe('AnalyticsService', () => {
    let service: AnalyticsService;

    const mockRepository = {
        createQueryBuilder: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            getRawMany: jest.fn().mockResolvedValue([
                { date: '2026-01-01', average_sentiment: '0.5' },
                { date: '2026-01-02', average_sentiment: '0.6' },
            ]),
        })),
        query: jest.fn().mockResolvedValue([
            { date: '2026-01-01', average_sentiment: '0.5' },
            { date: '2026-01-02', average_sentiment: '0.6' }
        ]),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AnalyticsService,
                {
                    provide: getRepositoryToken(SentimentHistory),
                    useValue: mockRepository,
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: {
                        get: jest.fn().mockResolvedValue(null),
                        set: jest.fn().mockResolvedValue(null),
                    },
                },
            ],
        }).compile();

        service = module.get<AnalyticsService>(AnalyticsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return recent sentiment trends', async () => {
        const trends = await service.getDailyTrends();
        expect(trends).toHaveLength(2);
        expect(trends[0].average_sentiment).toBe(0.6); // Due to reverse() logic
        expect(trends[1].average_sentiment).toBe(0.5);
        expect(mockRepository.query).toHaveBeenCalled();
    });
});
