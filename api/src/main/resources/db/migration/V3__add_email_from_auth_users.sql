-- V3: Add email column to profiles, initially nullable
ALTER TABLE public.profiles
    ADD COLUMN email TEXT;
