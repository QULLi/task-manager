-- V2__create_tasks_table.sql
-- Creates tasks table. Uses pgcrypto for gen_random_uuid (works on Supabase).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.tasks (
                                            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                                            owner_id uuid NOT NULL,
                                            title text NOT NULL,
                                            description text,
                                            due_date date,
                                            created_at timestamptz NOT NULL DEFAULT now(),
                                            updated_at timestamptz NOT NULL DEFAULT now(),
                                            CONSTRAINT fk_owner_profile FOREIGN KEY(owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_owner_id ON public.tasks(owner_id);
