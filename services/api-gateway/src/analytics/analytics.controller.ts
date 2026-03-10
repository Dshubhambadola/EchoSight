import { Controller, Get, Post, UseGuards, Query } from '@nestjs/common';
import { AuthGuard, Unprotected } from 'nest-keycloak-connect';
import { Roles } from 'nest-keycloak-connect';
import { AnalyticsService } from './analytics.service';
import { AiService } from './ai.service';
import { ProGuard } from '../auth/pro.guard';

@Controller('analytics')
export class AnalyticsController {
    constructor(
        private readonly analyticsService: AnalyticsService,
        private readonly aiService: AiService
    ) { }

    @Post('summary')
    @UseGuards(ProGuard)
    async generateSummary(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        const [stats, keywords, authors] = await Promise.all([
            this.analyticsService.getDashboardStats(startDate, endDate) as Promise<any>,
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
    async getTrends(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.analyticsService.getDailyTrends(startDate, endDate);
    }

    @Get('dashboard')
    async getDashboardStats(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.analyticsService.getDashboardStats(startDate, endDate);
    }

    @Get('distribution')
    async getDistribution(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.analyticsService.getPlatformDistribution(startDate, endDate);
    }

    @Get('keywords')
    async getKeywords(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('type') type?: string
    ) {
        return this.analyticsService.getTopKeywords(50, startDate, endDate, type);
    }

    @Get('authors')
    async getAuthors(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.analyticsService.getTopAuthors(10, startDate, endDate);
    }

    @Get('sounds')
    async getSounds(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.analyticsService.getTopSounds(10, startDate, endDate);
    }

    @Get('share-of-voice')
    async getShareOfVoice(
        @Query('queries') queries: string | string[],
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        const queryList = Array.isArray(queries) ? queries : [queries];
        return this.analyticsService.getShareOfVoice(queryList, startDate, endDate);
    }

    @Get('export')
    @UseGuards(ProGuard)
    async getRawData(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.analyticsService.getRawData(startDate, endDate);
    }

    @Get('feed')
    async getRecentMentions(@Query('limit') limit?: number) {
        return this.analyticsService.getRecentMentions(limit || 50);
    }
}
