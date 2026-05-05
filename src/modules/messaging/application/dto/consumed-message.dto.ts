export class ConsumedMessageDto {
  queue: string;
  content: Record<string, unknown>;
}
