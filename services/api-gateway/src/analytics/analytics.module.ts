import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { SentimentHistory } from './sentiment-history.entity';
import { AnalyticsService } from './analytics.service';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [TypeOrmModule.forFeature([SentimentHistory]), ConfigModule],
    controllers: [AnalyticsController],
    providers: [AnalyticsService, AiService],
})
export class AnalyticsModule { }
