import type { ClassOffering } from "@class-offering/domain/models/class-offering.entity";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ClassOfferingEventDto } from "@messaging/application/dto/class-offering-event.dto";
import { RabbitMQService } from "@messaging/infra/rabbitmq/rabbitmq.service";

const EXCHANGE_TYPE = "direct";

const CREATED = {
  exchange: "class-offering.created.exchange",
  routingKey: "class-offering.created",
};
const UPDATED = {
  exchange: "class-offering.updated.exchange",
  routingKey: "class-offering.updated",
};
const CANCELED = {
  exchange: "class-offering.canceled.exchange",
  routingKey: "class-offering.canceled",
};

@Injectable()
export class ClassOfferingPublisherService implements OnModuleInit {
  private readonly logger = new Logger(ClassOfferingPublisherService.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async onModuleInit(): Promise<void> {
    const channel = this.rabbitMQService.getChannel();
    await channel.assertExchange(CREATED.exchange, EXCHANGE_TYPE, { durable: true });
    await channel.assertExchange(UPDATED.exchange, EXCHANGE_TYPE, { durable: true });
    await channel.assertExchange(CANCELED.exchange, EXCHANGE_TYPE, { durable: true });
    this.logger.log("Class-offering publisher exchanges asserted");
  }

  publishCreated(classOffering: ClassOffering): void {
    this.publish(CREATED.exchange, CREATED.routingKey, ClassOfferingEventDto.from(classOffering));
  }

  publishUpdated(classOffering: ClassOffering): void {
    this.publish(UPDATED.exchange, UPDATED.routingKey, ClassOfferingEventDto.from(classOffering));
  }

  publishCanceled(classOffering: ClassOffering): void {
    this.publish(CANCELED.exchange, CANCELED.routingKey, ClassOfferingEventDto.from(classOffering));
  }

  private publish(exchange: string, routingKey: string, payload: object): void {
    const channel = this.rabbitMQService.getChannel();
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
    this.logger.log(`Published to ${exchange} [${routingKey}]`);
  }
}
