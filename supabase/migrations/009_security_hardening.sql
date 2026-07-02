-- 009 — security hardening from the live Advisors run (applied to the live
-- project on first setup; kept here so repo migrations match the database).
-- 1) Pin search_path on the trigger function (advisor: function_search_path_mutable).
-- 2) Revoke EXECUTE from anon on the SECURITY DEFINER helpers: no anon RLS policy
--    references them (the child/device path is SERVER-mediated per the H1 design),
--    so anon needs no direct /rest/v1/rpc access. authenticated keeps EXECUTE
--    because the RLS policies (all `to authenticated`) evaluate these functions.

alter function set_updated_at() set search_path = public;

revoke execute on function is_teacher_for_class(uuid)      from anon;
revoke execute on function is_parent_of_child(uuid)        from anon;
revoke execute on function is_child_in_teacher_class(uuid) from anon;
revoke execute on function has_child_grant(uuid)           from anon;
revoke execute on function can_access_child(uuid)          from anon;
revoke execute on function submission_child(uuid)          from anon;
revoke execute on function can_access_class_content(uuid)  from anon;
