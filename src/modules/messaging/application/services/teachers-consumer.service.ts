import { teachersSchema } from "@class-offering/infra/schemas/class-offering.schema";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { eq } from "drizzle-orm";
import { RabbitMQService } from "@messaging/infra/rabbitmq/rabbitmq.service";
import type { TeacherEventDto } from "@messaging/application/dto/teacher-event.dto";

const EXCHANGE_TYPE = "direct";

const CREATED = {
  queue: "class-offering.academic-teachers.created.queue",
  exchange: "academic.teachers.created.exchange",
  routingKey: "teacher.created",
};
const UPDATED = {
  queue: "class-offering.academic-teachers.updated.queue",
  exchange: "academic.teachers.updated.exchange",
  routingKey: "teacher.updated",
};
const DELETED = {
  queue: "class-offering.academic-teachers.deleted.queue",
  exchange: "academic.teachers.deleted.exchange",
  routingKey: "teacher.deleted",
};

@Injectable()
export class TeachersConsumerService implements OnModuleInit {
  private readonly logger = new Logger(TeachersConsumerService.name);

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
          const event: TeacherEventDto = JSON.parse(msg.content.toString());
          await this.drizzleService.db
            .insert(teachersSchema)
            .values({ id: event.id, name: event.name, email: event.email })
            .onConflictDoUpdate({
              target: teachersSchema.id,
              set: { name: event.name, email: event.email, updatedAt: new Date() },
            });
          channel.ack(msg);
        } catch (error) {
          this.logger.error(`teachers.created error: ${error}`);
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
          const event: TeacherEventDto = JSON.parse(msg.content.toString());
          await this.drizzleService.db
            .update(teachersSchema)
            .set({ name: event.name, email: event.email, updatedAt: new Date() })
            .where(eq(teachersSchema.id, event.id));
          channel.ack(msg);
        } catch (error) {
          this.logger.error(`teachers.updated error: ${error}`);
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
          const event: TeacherEventDto = JSON.parse(msg.content.toString());
          await this.drizzleService.db
            .delete(teachersSchema)
            .where(eq(teachersSchema.id, event.id));
          channel.ack(msg);
        } catch (error) {
          this.logger.error(`teachers.deleted error: ${error}`);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false },
    );

    this.logger.log("Teachers consumers started");
  }
}
