import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class ProGuard implements CanActivate {
    constructor(private billingService: BillingService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.sub) {
            throw new ForbiddenException('User identification missing from token');
        }

        const status = await this.billingService.getSubscriptionStatus(user.sub);

        if (status !== 'active') {
            throw new ForbiddenException('Upgrade to Pro required to access this feature');
        }

        return true;
    }
}
