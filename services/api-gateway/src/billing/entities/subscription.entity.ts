import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('subscriptions')
export class Subscription {
    @PrimaryColumn()
    userId: string; // From Keycloak (sub)

    @Column({ unique: true, nullable: true })
    stripeCustomerId: string;

    @Column({ nullable: true })
    stripeSubscriptionId: string;

    @Column({ default: 'inactive' })
    status: 'active' | 'inactive' | 'past_due' | 'canceled';

    @Column({ nullable: true })
    planType: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
