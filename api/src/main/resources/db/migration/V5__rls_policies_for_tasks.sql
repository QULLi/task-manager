-- V5__rls_policies_for_tasks.sql

-- 1) Enable RLS on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 2) Ensure no old policies cause conflicts
DROP POLICY IF EXISTS select_own_tasks ON public.tasks;
DROP POLICY IF EXISTS insert_own_tasks ON public.tasks;
DROP POLICY IF EXISTS update_own_tasks ON public.tasks;
DROP POLICY IF EXISTS delete_own_tasks ON public.tasks;

-- 3) Allow task owners full CRUD access to their own rows

-- a) Read (SELECT)
CREATE POLICY select_own_tasks
    ON public.tasks
    FOR SELECT
    USING (auth.uid() = owner_id);

-- b) Insert (INSERT)
CREATE POLICY insert_own_tasks
    ON public.tasks
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- c) Update (UPDATE)
CREATE POLICY update_own_tasks
    ON public.tasks
    FOR UPDATE
    USING (auth.uid() = owner_id);

-- d) Delete (DELETE)
CREATE POLICY delete_own_tasks
    ON public.tasks
    FOR DELETE
    USING (auth.uid() = owner_id);
