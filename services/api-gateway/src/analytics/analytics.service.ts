import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SentimentHistory } from './sentiment-history.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(SentimentHistory)
    private sentimentRepository: Repository<SentimentHistory>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  private buildDateWhereClause(startDate?: string, endDate?: string): string {
    let clause = '1=1';
    if (startDate) {
      clause += ` AND timestamp >= '${startDate}'`;
    }
    if (endDate) {
      clause += ` AND timestamp <= '${endDate}'`;
    }
    return clause;
  }

  async getDailyTrends(startDate?: string, endDate?: string) {
    const cacheKey = `analytics:trends:${startDate || 'all'}:${endDate || 'all'}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const where = this.buildDateWhereClause(startDate, endDate);
    const results = await this.sentimentRepository.query(`
      SELECT 
        DATE(timestamp) as date, 
        AVG(sentiment_score) as average_sentiment
      FROM sentiment_history 
      WHERE ${where}
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
      LIMIT 30
    `);
    // Reverse to show oldest to newest on chart
    const data = results.reverse().map((r: any) => ({
      date: typeof r.date === 'string' ? r.date.split('T')[0] : r.date.toISOString().split('T')[0],
      average_sentiment: parseFloat(r.average_sentiment)
    }));

    await this.cacheManager.set(cacheKey, data);
    return data;
  }

  async getPlatformDistribution(startDate?: string, endDate?: string) {
    const cacheKey = `analytics:dist:${startDate || 'all'}:${endDate || 'all'}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const where = this.buildDateWhereClause(startDate, endDate);
    const results = await this.sentimentRepository.query(`
      SELECT 
        platform, 
        COUNT(*) as count 
      FROM sentiment_history 
      WHERE ${where}
      GROUP BY platform
    `);
    const data = results.map((r: any) => ({
      platform: r.platform,
      count: parseInt(r.count, 10)
    }));

    await this.cacheManager.set(cacheKey, data);
    return data;
  }

  async getDashboardStats(startDate?: string, endDate?: string) {
    const cacheKey = `analytics:stats:${startDate || 'all'}:${endDate || 'all'}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const where = this.buildDateWhereClause(startDate, endDate);

    // Total Mentions
    const totalMentions = await this.sentimentRepository.query(
      `SELECT COUNT(*) as count FROM sentiment_history WHERE ${where}`
    );

    // Active Platforms
    const activePlatforms = await this.sentimentRepository.query(
      `SELECT COUNT(DISTINCT platform) as count FROM sentiment_history WHERE ${where}`
    );

    // Avg Sentiment
    const avgSentiment = await this.sentimentRepository.query(
      `SELECT AVG(sentiment_score) as avg FROM sentiment_history WHERE ${where}`
    );

    // Mentions last 24h (Fixed metric, usually always 24h regardless of filter, 
    // but arguably if looking at "All Time", user might still want "Current Velocity". 
    // Let's keep this as "Current Velocity" i.e. strict last 24h from NOW).
    const last24h = await this.sentimentRepository.query(
      "SELECT COUNT(*) as count FROM sentiment_history WHERE timestamp > NOW() - INTERVAL '24 hours'"
    );

    const data = {
      totalMentions: parseInt(totalMentions[0].count, 10),
      activePlatforms: parseInt(activePlatforms[0].count, 10),
      averageSentiment: parseFloat(avgSentiment[0].avg || 0).toFixed(2),
      mentionsLast24h: parseInt(last24h[0].count, 10),
    };

    await this.cacheManager.set(cacheKey, data);
    return data;
  }

  async getTopKeywords(limit: number = 50, startDate?: string, endDate?: string, type?: string) {
    const cacheKey = `analytics:keywords:${limit}:${startDate || 'all'}:${endDate || 'all'}:${type || 'default'}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const where = this.buildDateWhereClause(startDate, endDate);

    // If Entity Type is requested (PERSON, ORG, GPE)
    if (type && type !== 'ALL') {
      const results = await this.sentimentRepository.query(`
        SELECT 
          elem->>'text' as text, 
          COUNT(*) as value 
        FROM sentiment_history,
             jsonb_array_elements(entities) as elem
        WHERE ${where} 
          AND entities IS NOT NULL 
          AND elem->>'label' = '${type}'
        GROUP BY text
        ORDER BY value DESC
        LIMIT ${limit}
      `);
      await this.cacheManager.set(cacheKey, results);
      return results;
    }

    // Default: Fallback to simple regex on content (Legacy behavior for "All")
    const result = await this.sentimentRepository.query(
      `SELECT content FROM sentiment_history WHERE ${where}`
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

    const data = Object.entries(frequency)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);

    await this.cacheManager.set(cacheKey, data);
    return data;
  }

  async getTopAuthors(limit: number = 10, startDate?: string, endDate?: string) {
    const where = this.buildDateWhereClause(startDate, endDate);
    const results = await this.sentimentRepository.query(`
      SELECT 
        author, 
        COUNT(*) as count,
        MAX(author_followers) as reach,
        MAX(impact_score) as impact
      FROM sentiment_history 
      WHERE ${where} AND author IS NOT NULL AND author != ''
      GROUP BY author
      ORDER BY impact DESC
      LIMIT ${limit}
    `);

    return results.map((r: any) => ({
      name: r.author,
      count: parseInt(r.count, 10),
      reach: parseInt(r.reach || '0', 10),
      impact: parseFloat(r.impact || '0')
    }));
  }

  async getTopSounds(limit: number = 10, startDate?: string, endDate?: string) {
    const where = this.buildDateWhereClause(startDate, endDate);
    const results = await this.sentimentRepository.query(`
      SELECT 
        media_meta->>'sound' as sound,
        COUNT(*) as count
      FROM sentiment_history
      WHERE ${where} 
        AND media_meta IS NOT NULL 
        AND media_meta->>'sound' IS NOT NULL
      GROUP BY sound
      ORDER BY count DESC
      LIMIT ${limit}
    `);

    return results.map((r: any) => ({
      name: r.sound,
      count: parseInt(r.count, 10)
    }));
  }

  async getShareOfVoice(queries: string[], startDate?: string, endDate?: string) {
    const where = this.buildDateWhereClause(startDate, endDate);

    const results = await Promise.all(queries.map(async (q) => {
      // Sanitize simple query to prevent injection in LIKE (basic)
      // ideally use parameters, but query() with parameters array is safer.
      // TypeORM query: .query(sql, [params])
      const sanitized = `%${q}%`;
      const res = await this.sentimentRepository.query(
        `SELECT COUNT(*) as count FROM sentiment_history WHERE ${where} AND content ILIKE $1`,
        [sanitized]
      );
      return {
        name: q,
        value: parseInt(res[0].count, 10)
      };
    }));

    return results;
  }

  async getRawData(startDate?: string, endDate?: string) {
    const where = this.buildDateWhereClause(startDate, endDate);
    // Limit to 5000 to prevent performance issues during export
    return this.sentimentRepository.query(`
      SELECT * 
      FROM sentiment_history 
      WHERE ${where}
      ORDER BY timestamp DESC
      LIMIT 5000
    `);
  }
}
