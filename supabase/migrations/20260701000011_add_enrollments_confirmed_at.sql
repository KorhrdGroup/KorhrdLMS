ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

UPDATE public.enrollments
SET confirmed_at = updated_at
WHERE status = 'confirmed'
  AND confirmed_at IS NULL;

CREATE INDEX IF NOT EXISTS enrollments_confirmed_at_idx
  ON public.enrollments (confirmed_at DESC);
