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
    return results.map((r: any) => ({
      date: r.date,
      average_sentiment: parseFloat(r.average_sentiment)
    }));
  }

  async getPlatformDistribution() {
    const results = await this.sentimentRepository.query(`
      SELECT 
        platform, 
        COUNT(*) as count 
      FROM sentiment_history 
      GROUP BY platform
    `);
    return results.map((r: any) => ({
      platform: r.platform,
      count: parseInt(r.count, 10)
    }));
  }

  async getDashboardStats() {
    const totalMentions = await this.sentimentRepository.query('SELECT COUNT(*) as count FROM sentiment_history');
    const activePlatforms = await this.sentimentRepository.query('SELECT COUNT(DISTINCT platform) as count FROM sentiment_history');
    const avgSentiment = await this.sentimentRepository.query('SELECT AVG(sentiment_score) as avg FROM sentiment_history');
    const last24h = await this.sentimentRepository.query("SELECT COUNT(*) as count FROM sentiment_history WHERE timestamp > NOW() - INTERVAL '24 hours'");

    console.log('Raw Total Mentions:', totalMentions);
    console.log('Raw Active Platforms:', activePlatforms);

    return {
      totalMentions: parseInt(totalMentions[0].count, 10),
      activePlatforms: parseInt(activePlatforms[0].count, 10),
      averageSentiment: parseFloat(avgSentiment[0].avg || 0).toFixed(2),
      mentionsLast24h: parseInt(last24h[0].count, 10),
    };
  }
  async getTopKeywords(limit: number = 50) {
    // Fetch content from the last 7 days
    const result = await this.sentimentRepository.query(
      "SELECT content FROM sentiment_history WHERE timestamp > NOW() - INTERVAL '7 days'"
    );

    const text = result.map((r: any) => r.content).join(' ').toLowerCase();

    // Basic stop words list
    const stopWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'is', 'are', 'was', 'were', 'has', 'had', 'been', 'can', 'could', 'should', 'would', 'may', 'might', 'must', 'https', 'http', 'com', 'www', 'just', 'like', 'your', 'more', 'when', 'some', 'time', 'only', 'new', 'after', 'also', 'over', 'even', 'most', 'some', 'where', 'these', 'those', 'than', 'into', 'its', 'our', 'very', 'now', 'then', 'them', 'him', 'us', 'did', 'does', 'xyz', 'abc'
    ]);

    const words = text.match(/\b[a-z]{3,}\b/g) || [];
    const frequency: Record<string, number> = {};

    words.forEach((word: string) => {
      if (!stopWords.has(word)) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    return Object.entries(frequency)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }
}
