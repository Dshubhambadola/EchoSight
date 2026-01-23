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

    @CreateDateColumn()
    timestamp: Date;
}
