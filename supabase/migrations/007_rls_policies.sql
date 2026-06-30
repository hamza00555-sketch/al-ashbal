-- 007 — RLS policies. RLS was ENABLED on every table in 002–006. With RLS on and
-- NO permissive policy, access is DENIED by default. We add narrow policies only.
-- Writes that enforce business rules (registration, counters, approvals, points,
-- grant minting) are intentionally LEFT with no client policy → they go through
-- SECURITY DEFINER RPCs / server actions (Phase 1b/3/7). service_role bypasses RLS
-- and is used ONLY server-side.
--
-- All `select child_id from submissions …` / `class_students …` lookups inside
-- policies are wrapped in SECURITY DEFINER helpers to avoid recursive RLS.

-- ---- definer helpers used by policies below ----
create or replace function submission_child(p_submission_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select child_id from submissions where id = p_submission_id;
$$;

-- Can the caller (teacher of the class, or a parent/granted-device of a child in
-- the class) see this class's content?
create or replace function can_access_class_content(p_class_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select is_teacher_for_class(p_class_id)
      or exists (
        select 1 from class_students cs
        where cs.class_id = p_class_id and cs.status = 'active'
          and can_access_child(cs.child_id)
      );
$$;
grant execute on function submission_child(uuid)         to anon, authenticated;
grant execute on function can_access_class_content(uuid) to anon, authenticated;

-- ============================================================ profiles
create policy profiles_select_own on profiles for select to authenticated
  using (id = auth.uid());
create policy profiles_insert_own on profiles for insert to authenticated
  with check (id = auth.uid());
create policy profiles_update_own on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- DELETE: denied (no policy).

create policy teacher_profiles_rw_own on teacher_profiles for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy parent_profiles_rw_own on parent_profiles for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ============================================================ classes
create policy classes_select_teacher on classes for select to authenticated
  using (is_teacher_for_class(id));
-- INSERT/UPDATE/DELETE: service role / admin only (MVP seeds one class). No policy.

create policy class_teachers_select_self on class_teachers for select to authenticated
  using (teacher_id = auth.uid());
-- writes: service role only. No policy.

-- ============================================================ children
create policy children_select on children for select to authenticated
  using (can_access_child(id));
-- UPDATE limited columns by linked parent or class teacher (a device grant can
-- READ but not rename; the parent edits).
create policy children_update on children for update to authenticated
  using (is_parent_of_child(id) or is_child_in_teacher_class(id))
  with check (is_parent_of_child(id) or is_child_in_teacher_class(id));
-- INSERT/DELETE: via registration RPC / service role. No policy.

create policy class_students_select on class_students for select to authenticated
  using (is_teacher_for_class(class_id) or is_parent_of_child(child_id));
-- writes: registration RPC / service role. No policy.

create policy parent_child_links_select on parent_child_links for select to authenticated
  using (parent_id = auth.uid() or is_child_in_teacher_class(child_id));
create policy parent_child_links_update_own on parent_child_links for update to authenticated
  using (parent_id = auth.uid()) with check (parent_id = auth.uid());  -- status='removed'
-- INSERT: link_parent_to_child_by_code RPC only. DELETE: denied. No policy.

-- ============================================================ invitations + codes
-- Teacher sees ONLY their own invitations. Anon does NOT select (no enumeration);
-- anon validation/use goes through SECURITY DEFINER RPCs (Phase 3).
create policy invitations_select_creator on invitations for select to authenticated
  using (created_by_teacher_id = auth.uid());
create policy invitations_insert_creator on invitations for insert to authenticated
  with check (created_by_teacher_id = auth.uid() and is_teacher_for_class(class_id));
create policy invitations_update_creator on invitations for update to authenticated
  using (created_by_teacher_id = auth.uid())
  with check (created_by_teacher_id = auth.uid());  -- revoke
-- DELETE: denied.

create policy invitation_uses_select_teacher on invitation_uses for select to authenticated
  using (exists (select 1 from invitations i
                 where i.id = invitation_id and i.created_by_teacher_id = auth.uid()));
-- writes: RPC / service role only.

create policy child_access_codes_select on child_access_codes for select to authenticated
  using (is_parent_of_child(child_id) or is_child_in_teacher_class(child_id));
-- INSERT/UPDATE: createChildAccessCode / rotation RPC. Activation (anon) →
-- activate_child_on_device RPC (mints a grant). No broad client policy.

create policy parent_link_codes_select on parent_link_codes for select to authenticated
  using (is_parent_of_child(child_id));
-- INSERT/consume: RPC only. No broad client policy.

-- ============================================================ child_device_grants (C1)
create policy child_device_grants_select on child_device_grants for select to authenticated
  using (is_parent_of_child(child_id) or is_child_in_teacher_class(child_id));
create policy child_device_grants_revoke on child_device_grants for update to authenticated
  using (is_parent_of_child(child_id) or is_child_in_teacher_class(child_id));
-- INSERT: activate_child_on_device RPC (service-side) only. DELETE: denied.

-- ============================================================ learning content
create policy materials_select on learning_materials for select to authenticated
  using (can_access_class_content(class_id));
create policy materials_write_teacher on learning_materials for all to authenticated
  using (is_teacher_for_class(class_id)) with check (is_teacher_for_class(class_id));

create policy lessons_select on lessons for select to authenticated
  using (can_access_class_content(class_id));
create policy lessons_write_teacher on lessons for all to authenticated
  using (is_teacher_for_class(class_id)) with check (is_teacher_for_class(class_id));

create policy daily_prep_select on daily_prep for select to authenticated
  using (can_access_class_content(class_id));
create policy daily_prep_write_teacher on daily_prep for all to authenticated
  using (is_teacher_for_class(class_id)) with check (is_teacher_for_class(class_id));

create policy assignments_select on assignments for select to authenticated
  using (can_access_class_content(class_id));
create policy assignments_write_teacher on assignments for all to authenticated
  using (is_teacher_for_class(class_id)) with check (is_teacher_for_class(class_id));

-- ============================================================ submissions workflow
-- SELECT: linked parent, class teacher, or the child's granted device.
create policy submissions_select on submissions for select to authenticated
  using (can_access_child(child_id) or teacher_id = auth.uid());
-- INSERT/UPDATE: via submit_recording / finalize / approve / review RPCs only,
-- which validate authorization AND the state machine (C4). No client write policy.

create policy parent_approvals_select on parent_approvals for select to authenticated
  using (parent_id = auth.uid() or is_child_in_teacher_class(submission_child(submission_id)));
create policy parent_approvals_insert on parent_approvals for insert to authenticated
  with check (parent_id = auth.uid() and is_parent_of_child(submission_child(submission_id)));
-- UPDATE/DELETE: denied.

create policy teacher_reviews_select on teacher_reviews for select to authenticated
  using (teacher_id = auth.uid() or is_parent_of_child(submission_child(submission_id)));
create policy teacher_reviews_write on teacher_reviews for all to authenticated
  using (teacher_id = auth.uid() and is_child_in_teacher_class(submission_child(submission_id)))
  with check (teacher_id = auth.uid() and is_child_in_teacher_class(submission_child(submission_id)));
-- DELETE handled by the `for all` using-clause (teacher only); keep append-only in the RPC.

-- ============================================================ points / progress / attendance
create policy points_select on points_ledger for select to authenticated
  using (can_access_child(child_id));
create policy points_insert_teacher on points_ledger for insert to authenticated
  with check (is_child_in_teacher_class(child_id));  -- on review acceptance (append-only)
-- UPDATE/DELETE: denied (append-only).

create policy child_progress_select on child_progress for select to authenticated
  using (can_access_child(child_id));
-- writes: server/RPC only (or replace this table with a VIEW). No client policy.

create policy attendance_select on attendance_records for select to authenticated
  using (is_teacher_for_class(class_id) or is_parent_of_child(child_id));
create policy attendance_write_teacher on attendance_records for all to authenticated
  using (is_teacher_for_class(class_id)) with check (is_teacher_for_class(class_id));

-- ============================================================ audit_events
-- No client access at all (service role only). RLS on, no policy → denied.
