import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EventsGateway } from './events.gateway';

@Controller()
export class EventsController {
    constructor(private readonly eventsGateway: EventsGateway) { }

    @EventPattern('social-mentions')
    handleSocialMention(@Payload() data: any) {
        console.log('Received mention from Kafka:', data);
        this.eventsGateway.broadcastMention(data);
    }
}
