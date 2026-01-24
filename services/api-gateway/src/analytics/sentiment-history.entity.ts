import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('sentiment_history')
export class SentimentHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    platform: string;

    @Column()
    content: string;

    @Column({ nullable: true })
    author: string;

    @Column('float')
    sentiment_score: number;

    @Column('int', { default: 0 })
    author_followers: number;

    @Column('float', { default: 0 })
    impact_score: number;

    @Column('jsonb', { default: [], nullable: true })
    entities: { text: string; label: string }[];

    @Column('jsonb', { default: {}, nullable: true })
    media_meta: Record<string, string>;

    @CreateDateColumn()
    timestamp: Date;
}
