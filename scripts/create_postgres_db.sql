-- Script de bootstrap do banco PostgreSQL para o microservico.
-- Execucao (exemplo):
--   psql -h localhost -U postgres -f scripts/create_postgres_db.sql -v db_name=school_control
-- Se nao informar -v db_name=..., o valor padrao abaixo sera usado.

\set db_name 'school_control'

-- Cria o banco apenas se nao existir (comando especifico do psql).
SELECT format('CREATE DATABASE %I', :'db_name')
WHERE NOT EXISTS (
  SELECT 1
  FROM pg_database
  WHERE datname = :'db_name'
)\gexec

-- Conecta no banco alvo.
\connect :db_name

-- Necessario para gen_random_uuid().
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enum da turma.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'class_offering_status'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.class_offering_status AS ENUM ('active', 'inactive');
  END IF;
END $$;

-- Tabela de turmas (class offerings).
CREATE TABLE IF NOT EXISTS public.class_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  subject_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  status public.class_offering_status NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL
);

-- Tabela de usuarios (necessaria para autenticacao/autorizacao do microservico).
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  email text NOT NULL,
  password text NOT NULL,
  teacher_id uuid,
  permissions text[] NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  CONSTRAINT users_email_unique UNIQUE (email)
);
