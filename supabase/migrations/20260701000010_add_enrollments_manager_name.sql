ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS manager_name TEXT;
