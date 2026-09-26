-- Ticket 20: allow short phone-uploaded property walkthrough videos.
-- The frontend enforces one video, a 60-second duration, and a 25MB maximum.
-- Bucket restrictions provide server-side file size and MIME-type enforcement.

update storage.buckets
set
  file_size_limit = 26214400,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
where id in ('property-submissions', 'property-images');
