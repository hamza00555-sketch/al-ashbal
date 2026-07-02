-- 010 — table-level privileges (found by the production health check).
--
-- WHY: RLS policies only filter rows AFTER the role passes table-level GRANTs.
-- On this project the platform default privileges did not apply when the
-- tables were created (anon/authenticated/service_role ended up with only
-- REFERENCES/TRIGGER/TRUNCATE — no DML at all), so the first authenticated
-- profiles read after login failed with 42501 "permission denied".
--
-- MODEL (least privilege):
--   authenticated → DML only; every row still gated by the deny-by-default
--                   RLS policies in 007.
--   service_role  → full DML for the server-side admin client (bypasses RLS
--                   by design; used only after the server's own authz).
--   anon          → NOTHING. All policies are `to authenticated`; the child/
--                   device path is server-mediated (H1). Also revoke the odd
--                   TRUNCATE/REFERENCES/TRIGGER leftovers from client roles.

-- clean the odd leftovers from client-facing roles
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;
revoke all on all tables in schema public from anon;

-- authenticated: DML gated by RLS
grant select, insert, update, delete on all tables in schema public to authenticated;

-- service_role: everything (server-only key)
grant all on all tables in schema public to service_role;

-- future tables created by migrations (postgres role) get the same model
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges for role postgres in schema public
  grant all on tables to service_role;
