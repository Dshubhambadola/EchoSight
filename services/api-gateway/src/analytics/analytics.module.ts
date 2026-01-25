import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { AnalyticsController } from './analytics.controller';
import { SentimentHistory } from './sentiment-history.entity';
import { AnalyticsService } from './analytics.service';
import { AiService } from './ai.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([SentimentHistory]),
        ConfigModule,
        CacheModule.register({
            store: redisStore,
            host: process.env.REDIS_HOST || 'echosight-redis',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            ttl: 300000, // 5 minutes
        }),
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService, AiService],
})
export class AnalyticsModule { }
