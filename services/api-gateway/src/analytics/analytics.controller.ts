import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuthGuard, Unprotected } from 'nest-keycloak-connect';
import { Roles } from 'nest-keycloak-connect';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

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
        @Query('endDate') endDate?: string
    ) {
        return this.analyticsService.getTopKeywords(50, startDate, endDate);
    }

    @Get('authors')
    @Unprotected()
    async getAuthors(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.analyticsService.getTopAuthors(10, startDate, endDate);
    }
}
