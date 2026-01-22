import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, Unprotected } from 'nest-keycloak-connect';
import { Roles } from 'nest-keycloak-connect';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('trends')
    @Unprotected()
    async getTrends() {
        return this.analyticsService.getDailyTrends();
    }

    @Get('dashboard')
    @Unprotected()
    async getDashboardStats() {
        return this.analyticsService.getDashboardStats();
    }

    @Get('distribution')
    @Unprotected()
    async getDistribution() {
        return this.analyticsService.getPlatformDistribution();
    }

    @Get('keywords')
    @Unprotected()
    async getKeywords() {
        return this.analyticsService.getTopKeywords();
    }
}
