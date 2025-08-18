-- V1__create_profiles_table.sql
CREATE TABLE IF NOT EXISTS public.profiles (
                                               id uuid PRIMARY KEY,
                                               email text,
                                               username text,
                                               avatar_url text,
                                               updated_at timestamptz
);
