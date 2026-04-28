-- Migration: 0003_specialist_schema
-- Adequação do banco de dados para o microsserviço de ofertas de turmas
--> statement-breakpoint

-- Colunas novas em subjects
ALTER TABLE "subjects"
  ADD COLUMN IF NOT EXISTS "description" varchar(1000),
  ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone NOT NULL DEFAULT now();

--> statement-breakpoint

-- Colunas novas em teachers
ALTER TABLE "teachers"
  ADD COLUMN IF NOT EXISTS "email" varchar(255) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone NOT NULL DEFAULT now();

--> statement-breakpoint

-- Unicidade do email em teachers
ALTER TABLE "teachers"
  ADD CONSTRAINT "teachers_email_unique" UNIQUE ("email");

--> statement-breakpoint

-- Remove o DEFAULT temporário do email (só existia para não quebrar dados existentes)
ALTER TABLE "teachers"
  ALTER COLUMN "email" DROP DEFAULT;

--> statement-breakpoint

-- defaultNow nas datas de class_offerings
ALTER TABLE "class_offerings"
  ALTER COLUMN "created_at" SET DEFAULT now(),
  ALTER COLUMN "updated_at" SET DEFAULT now();

--> statement-breakpoint

-- FK: class_offerings → subjects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'class_offerings_subject_id_subjects_id_fk'
  ) THEN
    ALTER TABLE "class_offerings"
      ADD CONSTRAINT "class_offerings_subject_id_subjects_id_fk"
      FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id")
      ON DELETE RESTRICT;
  END IF;
END $$;

--> statement-breakpoint

-- FK: class_offerings → teachers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'class_offerings_teacher_id_teachers_id_fk'
  ) THEN
    ALTER TABLE "class_offerings"
      ADD CONSTRAINT "class_offerings_teacher_id_teachers_id_fk"
      FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id")
      ON DELETE RESTRICT;
  END IF;
END $$;

--> statement-breakpoint

-- FK: users → teachers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_teacher_id_teachers_id_fk'
  ) THEN
    ALTER TABLE "users"
      ADD CONSTRAINT "users_teacher_id_teachers_id_fk"
      FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id")
      ON DELETE SET NULL;
  END IF;
END $$;