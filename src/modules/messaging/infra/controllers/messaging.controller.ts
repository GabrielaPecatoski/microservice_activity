import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ConsumedMessageDto } from "@messaging/application/dto/consumed-message.dto";
import { PublishMessageDto } from "@messaging/application/dto/publish-message.dto";
import { MessagingService } from "@messaging/application/services/messaging.service";

const PUBLISHER_EXCHANGES = [
  { exchange: "class-offering.created.exchange", routingKey: "class-offering.created" },
  { exchange: "class-offering.updated.exchange", routingKey: "class-offering.updated" },
  { exchange: "class-offering.canceled.exchange", routingKey: "class-offering.canceled" },
];

const CONSUMER_QUEUES = [
  {
    queue: "class-offering.academic-subjects.created.queue",
    exchange: "academic.subjects.created.exchange",
    routingKey: "subject.created",
  },
  {
    queue: "class-offering.academic-subjects.updated.queue",
    exchange: "academic.subjects.updated.exchange",
    routingKey: "subject.updated",
  },
  {
    queue: "class-offering.academic-subjects.deleted.queue",
    exchange: "academic.subjects.deleted.exchange",
    routingKey: "subject.deleted",
  },
  {
    queue: "class-offering.academic-teachers.created.queue",
    exchange: "academic.teachers.created.exchange",
    routingKey: "teacher.created",
  },
  {
    queue: "class-offering.academic-teachers.updated.queue",
    exchange: "academic.teachers.updated.exchange",
    routingKey: "teacher.updated",
  },
  {
    queue: "class-offering.academic-teachers.deleted.queue",
    exchange: "academic.teachers.deleted.exchange",
    routingKey: "teacher.deleted",
  },
];

@Controller("messaging")
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post("exchange")
  async assertExchanges(): Promise<{ message: string }> {
    for (const { exchange } of PUBLISHER_EXCHANGES) {
      await this.messagingService.assertExchange(exchange);
    }
    return { message: "Publisher exchanges asserted" };
  }

  @Post("queue")
  async assertQueues(): Promise<{ message: string }> {
    for (const { queue, exchange, routingKey } of CONSUMER_QUEUES) {
      await this.messagingService.assertExchange(exchange);
      await this.messagingService.assertQueue(queue);
      await this.messagingService.bindQueue(queue, exchange, routingKey);
    }
    return { message: "Consumer queues asserted and bound" };
  }

  @Post("publish")
  publish(@Body() dto: PublishMessageDto): { message: string } {
    this.messagingService.publish(dto.exchange, dto.routingKey, dto.payload);
    return { message: `Published to ${dto.exchange} [${dto.routingKey}]` };
  }

  @Get("consume")
  consume(@Query("queue") queue: string): Promise<ConsumedMessageDto> {
    if (!queue) throw new BadRequestException("query param 'queue' is required");
    return this.messagingService.consume(queue);
  }
}
