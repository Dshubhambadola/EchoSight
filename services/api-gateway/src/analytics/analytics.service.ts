import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SentimentHistory } from './sentiment-history.entity';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(SentimentHistory)
        private sentimentRepository: Repository<SentimentHistory>,
    ) { }

    async getDailyTrends() {
        // Simple mock aggregation for now, or real partial query
        const results = await this.sentimentRepository.query(`
      SELECT 
        DATE(timestamp) as date, 
        AVG(sentiment_score) as average_sentiment
      FROM sentiment_history 
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
      LIMIT 7
    `);
        return results;
    }

    async getPlatformDistribution() {
        const results = await this.sentimentRepository.query(`
      SELECT 
        platform, 
        COUNT(*) as count 
      FROM sentiment_history 
      GROUP BY platform
    `);
        return results;
    }
}
