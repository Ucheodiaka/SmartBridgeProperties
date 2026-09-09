BEGIN;

-- Align the legacy submission table with the current application payload.
ALTER TABLE public.property_submissions
  ADD COLUMN IF NOT EXISTS listing_type TEXT NOT NULL DEFAULT 'sale',
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS title_doc_type TEXT,
  ADD COLUMN IF NOT EXISTS videos TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL
    DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS approved_property_id TEXT;

UPDATE public.property_submissions
SET title_doc_type = title_document_type
WHERE title_doc_type IS NULL
  AND title_document_type IS NOT NULL;

ALTER TABLE public.property_submissions
  ALTER COLUMN neighborhood DROP NOT NULL,
  ALTER COLUMN title_document_type DROP NOT NULL;

ALTER TABLE public.property_submissions
  DROP CONSTRAINT IF EXISTS property_submissions_listing_type_check;

ALTER TABLE public.property_submissions
  ADD CONSTRAINT property_submissions_listing_type_check
  CHECK (listing_type IN ('sale', 'rent'));

NOTIFY pgrst, 'reload schema';

COMMIT;
