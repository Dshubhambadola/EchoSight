import { Controller, Get, Post, UseGuards, Query } from '@nestjs/common';
import { AuthGuard, Unprotected } from 'nest-keycloak-connect';
import { Roles } from 'nest-keycloak-connect';
import { AnalyticsService } from './analytics.service';
import { AiService } from './ai.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(
        private readonly analyticsService: AnalyticsService,
        private readonly aiService: AiService
    ) { }

    @Post('summary')
    @Unprotected()
    async generateSummary(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        const [stats, keywords, authors] = await Promise.all([
            this.analyticsService.getDashboardStats(startDate, endDate),
            this.analyticsService.getTopKeywords(20, startDate, endDate),
            this.analyticsService.getTopAuthors(5, startDate, endDate)
        ]);

        const context = `
            Period: ${startDate || 'All Time'} to ${endDate || 'Now'}
            Total Mentions: ${stats.totalMentions}
            Average Sentiment Score: ${stats.averageSentiment} (-1.0 to 1.0)
            Top Keywords: ${keywords.map((k: any) => `${k.text} (${k.value})`).join(', ')}
            Top Authors: ${authors.map((a: any) => `${a.name} (${a.count})`).join(', ')}
        `;

        return { summary: await this.aiService.generateSummary(context) };
    }

    @Get('trends')
    @Unprotected()
    async getTrends(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.analyticsService.getDailyTrends(startDate, endDate);
    }

    @Get('dashboard')
    @Unprotected()
    async getDashboardStats(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.analyticsService.getDashboardStats(startDate, endDate);
    }

    @Get('distribution')
    @Unprotected()
    async getDistribution(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.analyticsService.getPlatformDistribution(startDate, endDate);
    }

    @Get('keywords')
    @Unprotected()
    async getKeywords(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('type') type?: string
    ) {
        return this.analyticsService.getTopKeywords(50, startDate, endDate, type);
    }

    @Get('authors')
    @Unprotected()
    async getAuthors(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.analyticsService.getTopAuthors(10, startDate, endDate);
    }

    @Get('sounds')
    @Unprotected()
    async getSounds(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.analyticsService.getTopSounds(10, startDate, endDate);
    }

    @Get('share-of-voice')
    @Unprotected()
    async getShareOfVoice(
        @Query('queries') queries: string | string[],
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        const queryList = Array.isArray(queries) ? queries : [queries];
        return this.analyticsService.getShareOfVoice(queryList, startDate, endDate);
    }

    @Get('export')
    @Unprotected()
    async getRawData(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.analyticsService.getRawData(startDate, endDate);
    }
}
