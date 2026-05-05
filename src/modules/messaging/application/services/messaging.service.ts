import { Injectable, NotFoundException } from "@nestjs/common";
import { ConsumedMessageDto } from "@messaging/application/dto/consumed-message.dto";
import { RabbitMQService } from "@messaging/infra/rabbitmq/rabbitmq.service";

const EXCHANGE_TYPE = "direct";

@Injectable()
export class MessagingService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async assertExchange(exchange: string): Promise<void> {
    const channel = this.rabbitMQService.getChannel();
    await channel.assertExchange(exchange, EXCHANGE_TYPE, { durable: true });
  }

  async assertQueue(queue: string): Promise<void> {
    const channel = this.rabbitMQService.getChannel();
    await channel.assertQueue(queue, { durable: true });
  }

  async bindQueue(queue: string, exchange: string, routingKey: string): Promise<void> {
    const channel = this.rabbitMQService.getChannel();
    await channel.bindQueue(queue, exchange, routingKey);
  }

  publish(exchange: string, routingKey: string, payload: object): void {
    const channel = this.rabbitMQService.getChannel();
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
  }

  async consume(queue: string): Promise<ConsumedMessageDto> {
    const channel = this.rabbitMQService.getChannel();
    const msg = await channel.get(queue, { noAck: false });
    if (!msg) {
      throw new NotFoundException(`No messages in queue: ${queue}`);
    }
    const content = JSON.parse(msg.content.toString()) as Record<string, unknown>;
    channel.ack(msg);
    return { queue, content };
  }
}
