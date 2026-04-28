import {
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const classOfferingStatusEnum = pgEnum("class_offering_status", [
  "active",
  "inactive",
]);

// ==================== SUBJECTS ====================
export const subjectsSchema = pgTable("subjects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),          // NOVO
  createdAt: timestamp("created_at", { withTimezone: true })       // NOVO
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })       // NOVO
    .notNull()
    .defaultNow(),
});

// ==================== TEACHERS ====================
export const teachersSchema = pgTable("teachers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),     // NOVO
  createdAt: timestamp("created_at", { withTimezone: true })       // NOVO
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })       // NOVO
    .notNull()
    .defaultNow(),
});

// ==================== CLASS OFFERINGS ====================
export const classOfferingsSchema = pgTable("class_offerings", {
  id: uuid("id").primaryKey().defaultRandom(),

  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjectsSchema.id, { onDelete: "restrict" }), // onDelete adicionado

  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachersSchema.id, { onDelete: "restrict" }), // onDelete adicionado

  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),

  status: classOfferingStatusEnum("status").notNull().default("active"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});