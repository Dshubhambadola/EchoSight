import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'nest-keycloak-connect';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('trends')
    async getTrends() {
        return this.analyticsService.getDailyTrends();
    }

    @Get('distribution')
    async getDistribution() {
        return this.analyticsService.getPlatformDistribution();
    }
}
