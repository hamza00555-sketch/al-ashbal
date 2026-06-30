-- 008 — private Storage bucket for recordings.
-- Recordings are sensitive children's data: the bucket is PRIVATE. Direct client
-- read/write is DENIED (storage.objects has RLS; we add NO permissive client
-- policy). All access goes through SERVER-minted signed URLs (service role), after
-- a can_access_child / teacher check — see the C4 upload flow in the plan.

-- Create the private bucket with a size cap + MIME allow-list (defence in depth).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recordings',
  'recordings',
  false,                                  -- PRIVATE (never public)
  52428800,                               -- 50 MB cap
  array['audio/webm','audio/mp4','audio/ogg','video/webm','video/mp4']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------- access model
-- Path strategy (SERVER-generated only; the client NEVER chooses the path):
--   recordings/{class_id}/{child_id}/{submission_id}.{ext}
--
-- Intended access (to COMPLETE in Phase 7 — kept as documented placeholders so we
-- do not ship a weak/over-broad policy now):
--   * UPLOAD: only via requestUploadIntent + a short-lived signed upload URL minted
--     server-side after can_access_child(child_id) + assignment + MIME/size checks.
--   * READ/DOWNLOAD: only via short-lived signed download URLs minted server-side
--     after can_access_child(child_id) OR teacher_id check against the submission
--     row resolved from the path. Anon / unrelated users → denied.
--   * DELETE: retention/reconciliation job or admin (service role) only.
--
-- Example object-level policy to add in Phase 7 (NOT enabled now — needs the
-- submissions row + a path parser, and the grant GUC wired in Phase 1b):
--
--   create policy recordings_read on storage.objects for select to authenticated
--   using (
--     bucket_id = 'recordings'
--     and exists (
--       select 1 from submissions s
--       where s.recording_path = storage.objects.name
--         and (can_access_child(s.child_id) or s.teacher_id = auth.uid())
--     )
--   );
--
-- Until then: NO client policy on storage.objects for this bucket → direct client
-- access is DENIED by default; only service-role-minted signed URLs work. SAFE.
--
-- TODO (Phase 7, must-complete before recordings go live):
--   1. server actions: requestUploadIntent / finalizeSubmission / signed download.
--   2. storage RLS policies (read/upload) as above, once the path parser + grant
--      GUC are in place.
--   3. orphan-cleanup job for stale `uploading` submissions + objects.
