import { IsObject, IsString } from "class-validator";

export class PublishMessageDto {
  @IsString()
  exchange: string;

  @IsString()
  routingKey: string;

  @IsObject()
  payload: Record<string, unknown>;
}
