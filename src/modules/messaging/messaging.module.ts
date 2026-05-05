import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SharedModule } from "@shared/shared.module";
import { MessagingService } from "./application/services/messaging.service";
import { ClassOfferingPublisherService } from "./application/services/class-offering-publisher.service";
import { SubjectsConsumerService } from "./application/services/subjects-consumer.service";
import { TeachersConsumerService } from "./application/services/teachers-consumer.service";
import { MessagingController } from "./infra/controllers/messaging.controller";
import { RabbitMQService } from "./infra/rabbitmq/rabbitmq.service";

@Module({
  imports: [ConfigModule, SharedModule],
  controllers: [MessagingController],
  providers: [
    RabbitMQService,
    MessagingService,
    ClassOfferingPublisherService,
    SubjectsConsumerService,
    TeachersConsumerService,
  ],
  exports: [ClassOfferingPublisherService],
})
export class MessagingModule {}
