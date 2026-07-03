-- 012 — SECURITY DEFINER helpers: close the PUBLIC-EXECUTE gap (launch gate).
--
-- 009 revoked EXECUTE from `anon` directly, but Postgres grants EXECUTE to
-- PUBLIC by default on function creation — and anon INHERITS that, so the
-- Supabase security advisor still flagged every helper as anon-executable via
-- /rest/v1/rpc. Fix: revoke from PUBLIC and grant explicitly to authenticated
-- (RLS policies evaluate these as the querying user, so authenticated MUST
-- keep EXECUTE or every policy check would start failing).
--
-- The `authenticated`-can-execute advisor WARN remains by design: signed-in
-- users calling the helpers directly only learn what RLS already lets them
-- see (booleans about their own access).

do $$
declare fn text;
begin
  foreach fn in array array[
    'is_teacher_for_class(uuid)',
    'is_parent_of_child(uuid)',
    'is_child_in_teacher_class(uuid)',
    'has_child_grant(uuid)',
    'can_access_child(uuid)',
    'submission_child(uuid)',
    'can_access_class_content(uuid)',
    'is_app_teacher()'
  ] loop
    execute format('revoke execute on function %s from public, anon', fn);
    execute format('grant execute on function %s to authenticated, service_role', fn);
  end loop;
end $$;

-- Platform-provided helper: also close it if we own it (ignore if not ours).
do $$ begin
  revoke execute on function rls_auto_enable() from public, anon;
exception when insufficient_privilege then
  raise notice 'rls_auto_enable is platform-owned; left as provided';
end $$;

-- Future functions created by migrations: no implicit PUBLIC execute.
alter default privileges for role postgres in schema public
  revoke execute on functions from public;
