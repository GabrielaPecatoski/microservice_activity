import {
  classOfferingStatusEnum,
  classOfferingsSchema,
} from "@class-offering/infra/schemas/class-offering.schema";
import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { usersSchema } from "@users/infra/schemas/user.schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const schema = {
  classOfferingsSchema,
  classOfferingStatusEnum,
  usersSchema,
};

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  private readonly pool: Pool;
  public readonly db;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
