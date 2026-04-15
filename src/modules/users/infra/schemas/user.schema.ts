import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { teachersSchema } from "@class-offering/infra/schemas/class-offering.schema";

export const usersSchema = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  teacherId: uuid("teacher_id").references(() => teachersSchema.id, {
    onDelete: "set null",   // NOVO — FK real com constraint no banco
  }),
  permissions: text("permissions").array().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});