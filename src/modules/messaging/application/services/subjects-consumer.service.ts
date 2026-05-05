import { subjectsSchema } from "@class-offering/infra/schemas/class-offering.schema";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { eq } from "drizzle-orm";
import { RabbitMQService } from "@messaging/infra/rabbitmq/rabbitmq.service";
import type { SubjectEventDto } from "@messaging/application/dto/subject-event.dto";

const EXCHANGE_TYPE = "direct";

const CREATED = {
  queue: "class-offering.academic-subjects.created.queue",
  exchange: "academic.subjects.created.exchange",
  routingKey: "subject.created",
};
const UPDATED = {
  queue: "class-offering.academic-subjects.updated.queue",
  exchange: "academic.subjects.updated.exchange",
  routingKey: "subject.updated",
};
const DELETED = {
  queue: "class-offering.academic-subjects.deleted.queue",
  exchange: "academic.subjects.deleted.exchange",
  routingKey: "subject.deleted",
};

@Injectable()
export class SubjectsConsumerService implements OnModuleInit {
  private readonly logger = new Logger(SubjectsConsumerService.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly drizzleService: DrizzleService,
  ) {}

  async onModuleInit(): Promise<void> {
    const channel = this.rabbitMQService.getChannel();

    for (const binding of [CREATED, UPDATED, DELETED]) {
      await channel.assertExchange(binding.exchange, EXCHANGE_TYPE, { durable: true });
      await channel.assertQueue(binding.queue, { durable: true });
      await channel.bindQueue(binding.queue, binding.exchange, binding.routingKey);
    }

    await channel.consume(
      CREATED.queue,
      async (msg) => {
        if (!msg) return;
        try {
          const event: SubjectEventDto = JSON.parse(msg.content.toString());
          await this.drizzleService.db
            .insert(subjectsSchema)
            .values({ id: event.id, name: event.name, description: event.description })
            .onConflictDoUpdate({
              target: subjectsSchema.id,
              set: { name: event.name, description: event.description, updatedAt: new Date() },
            });
          channel.ack(msg);
        } catch (error) {
          this.logger.error(`subjects.created error: ${error}`);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false },
    );

    await channel.consume(
      UPDATED.queue,
      async (msg) => {
        if (!msg) return;
        try {
          const event: SubjectEventDto = JSON.parse(msg.content.toString());
          await this.drizzleService.db
            .update(subjectsSchema)
            .set({ name: event.name, description: event.description, updatedAt: new Date() })
            .where(eq(subjectsSchema.id, event.id));
          channel.ack(msg);
        } catch (error) {
          this.logger.error(`subjects.updated error: ${error}`);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false },
    );

    await channel.consume(
      DELETED.queue,
      async (msg) => {
        if (!msg) return;
        try {
          const event: SubjectEventDto = JSON.parse(msg.content.toString());
          await this.drizzleService.db
            .delete(subjectsSchema)
            .where(eq(subjectsSchema.id, event.id));
          channel.ack(msg);
        } catch (error) {
          this.logger.error(`subjects.deleted error: ${error}`);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false },
    );

    this.logger.log("Subjects consumers started");
  }
}
