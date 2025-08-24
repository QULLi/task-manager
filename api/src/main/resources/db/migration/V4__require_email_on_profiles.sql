-- V4: Backfill email column and enforce constraints

-- 1) Copy emails from auth.users into profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

-- 2) Set NOT NULL on email
ALTER TABLE public.profiles
    ALTER COLUMN email SET NOT NULL;

-- 3) Add UNIQUE constraint
ALTER TABLE public.profiles
    ADD CONSTRAINT uq_profiles_email UNIQUE (email);
