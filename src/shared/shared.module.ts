import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { HateoasInterceptor } from "./infra/hateoas";
import { DrizzleService } from "./infra/database/drizzle.service";

@Module({
  providers: [
    DrizzleService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HateoasInterceptor,
    },
  ],
  exports: [DrizzleService],
})
export class SharedModule {}
