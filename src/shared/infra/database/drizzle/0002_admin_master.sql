CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "password" text NOT NULL,
  "teacher_id" uuid,
  "permissions" text[] NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint

INSERT INTO "users" (
  "email",
  "password",
  "teacher_id",
  "permissions",
  "created_at",
  "updated_at"
)
SELECT
  'admin@schoolcontrol.com',
  '$2b$10$s0FI2J3S85bIYqhQ7UrL9e7KsnPVTDr989ZZTKZADFZT4a9dDzcZ2',
  NULL,
  ARRAY[
    'users:read',
    'users:write',
    'users:delete',
    'class-offerings:read',
    'class-offerings:write',
    'class-offerings:delete'
  ]::text[],
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM "users"
  WHERE "email" = 'admin@schoolcontrol.com'
);
