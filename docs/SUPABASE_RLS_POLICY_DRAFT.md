# Supabase RLS Policy Draft (Section 7)

> Planning only. Draft policies — refine during implementation. **RLS is ENABLED
> on every table.** Default posture: deny-all, then add narrow policies. Anything
> that enforces a business rule (invitation use, registration, approvals, points)
> goes through a **`SECURITY DEFINER` RPC** or a **server action using the service
> role**, NOT a direct client write.

## Helper predicates (implement as SQL functions, `stable`)

```sql
-- current auth uid
auth.uid()

-- is the current user a teacher of this class?
create function is_class_teacher(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from class_teachers ct
    where ct.class_id = cid and ct.teacher_id = auth.uid()
  );
$$;

-- is the current user a (active) linked parent of this child?
create function is_linked_parent(child uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from parent_child_links l
    where l.child_id = child and l.parent_id = auth.uid() and l.status = 'active'
  );
$$;

-- is the current user a teacher of the child's class?
create function is_childs_class_teacher(child uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from class_students cs
    join class_teachers ct on ct.class_id = cs.class_id
    where cs.child_id = child and ct.teacher_id = auth.uid()
  );
$$;
```

> Note: `auth.uid()` is null for anonymous users → all `is_*` helpers return
> false, so anon is denied everywhere except the explicit anon policies below.

---

## Per-table policies

Format: `RLS: yes` then SELECT / INSERT / UPDATE / DELETE intent + draft.

### `profiles`
- SELECT: a user reads own row; teacher reads parents linked to their class
  children (optional). Draft: `using (id = auth.uid())` (+ optional teacher rule).
- INSERT: created by server on signup (service role) or `with check (id = auth.uid())`.
- UPDATE: `using (id = auth.uid()) with check (id = auth.uid())` (own display/avatar).
- DELETE: denied (no client delete).

### `teacher_profiles` / `parent_profiles`
- SELECT/UPDATE: `using (id = auth.uid())`. INSERT: server on signup. DELETE: denied.

### `classes`
- SELECT: `using (is_class_teacher(id))` (teachers of the class). Parents/children
  don't browse classes.
- INSERT/UPDATE/DELETE: service role / admin only (MVP seeds one class).

### `class_teachers`
- SELECT: `using (teacher_id = auth.uid())`.
- INSERT/UPDATE/DELETE: service role / admin only.

### `children`
- SELECT: `using (is_linked_parent(id) or is_childs_class_teacher(id))`.
- INSERT: via server/RPC during registration (service role). (No open client insert.)
- UPDATE: `using (is_linked_parent(id) or is_childs_class_teacher(id))
  with check (same)` — limited columns (display_name, avatar, age, level).
- DELETE: denied client-side (soft-delete via status if ever needed).

### `class_students`
- SELECT: `using (is_class_teacher(class_id) or is_linked_parent(child_id))`.
- INSERT/UPDATE/DELETE: server/RPC (enrolment happens during registration).

### `parent_child_links`
- SELECT: `using (parent_id = auth.uid() or is_childs_class_teacher(child_id))`.
- INSERT: via `link_parent_to_child_by_code` RPC (validates the WLD code) — not a
  direct client insert. UPDATE (status='removed'): `using (parent_id = auth.uid())`.
- DELETE: denied (use status).

### `invitations`
- SELECT: `using (created_by_teacher_id = auth.uid())` — a teacher sees only their
  own invitations. **Anon does NOT select this table** (no browsing all codes).
- INSERT: `with check (created_by_teacher_id = auth.uid() and is_class_teacher(class_id))`
  (or via `create_invitation` RPC).
- UPDATE (revoke): `using (created_by_teacher_id = auth.uid())`.
- DELETE: denied.
- **Anon validation/use:** through a `SECURITY DEFINER` RPC `validate_invitation(code)`
  that returns ONLY the safe public fields (type, label, max_children, expiry,
  status) for ONE code — never a table scan. Registration goes through
  `register_*_from_invitation` RPCs.

### `invitation_uses`
- SELECT: `using (is_class_teacher((select class_id from invitations i where i.id = invitation_id)))`.
- INSERT/UPDATE/DELETE: service role / RPC only.

### `child_access_codes`
- SELECT: `using (is_linked_parent(child_id) or is_childs_class_teacher(child_id))`
  (so a parent can re-show a child's code). **Anon cannot SELECT.**
- INSERT: server/RPC during registration.
- Activation on a device → `activate_child_on_device(code)` RPC (anon-callable,
  rate-limited) returns a short-lived child-access token; does NOT expose the table.
- UPDATE/DELETE: denied client-side.

### `parent_link_codes`
- SELECT: `using (is_linked_parent(child_id))`. INSERT: server/RPC. Consume via
  `link_parent_to_child_by_code(code)` RPC. UPDATE/DELETE: denied client-side.

### `learning_materials` / `lessons` / `daily_prep` / `assignments`
- SELECT: `using (is_class_teacher(class_id) or
  exists(select 1 from class_students cs where cs.class_id = <class_id> and
  is_linked_parent(cs.child_id)) )` — teacher of class, or a parent/child of the
  class. (For `lessons`, resolve `class_id` via the parent material.)
- INSERT/UPDATE/DELETE: `using (is_class_teacher(class_id)) with check (is_class_teacher(class_id))`
  — only the class teacher authors content.

### `submissions`
- SELECT: `using ( is_linked_parent(child_id) or teacher_id = auth.uid()
  or is_childs_class_teacher(child_id) )`. (Child/device path: a server action
  scoped to the active child id from the device token.)
- INSERT: via `submit_recording` RPC/server action (validates the device is
  authorized for `child_id` and the file path); not a raw client insert.
- UPDATE: parent transitions `pending_parent`→`pending_teacher`/`rerecord`
  `using (is_linked_parent(child_id))`; teacher transitions →`accepted`/`rerecord`
  `using (teacher_id = auth.uid() or is_childs_class_teacher(child_id))`.
  Enforce allowed state transitions in the RPC.
- DELETE: denied client-side.

### `parent_approvals`
- SELECT: `using (parent_id = auth.uid() or
  is_childs_class_teacher((select child_id from submissions s where s.id = submission_id)))`.
- INSERT: `with check (parent_id = auth.uid() and
  is_linked_parent((select child_id from submissions s where s.id = submission_id)))`.
- UPDATE/DELETE: denied.

### `teacher_reviews`
- SELECT: `using ( teacher_id = auth.uid()
  or is_linked_parent((select child_id from submissions s where s.id = submission_id)) )`.
- INSERT/UPDATE: `with check (teacher_id = auth.uid() and
  is_childs_class_teacher((select child_id from submissions s where s.id = submission_id)))`.
- DELETE: denied.

### `points_ledger`
- SELECT: `using (is_linked_parent(child_id) or is_childs_class_teacher(child_id))`.
- INSERT: via server/RPC on teacher review acceptance
  (`with check (is_childs_class_teacher(child_id))`).
- UPDATE/DELETE: denied (append-only).

### `child_progress` (or a VIEW)
- SELECT: `using (is_linked_parent(child_id) or is_childs_class_teacher(child_id))`.
- Writes: server/RPC only (or computed view → no writes).

### `attendance_records`
- SELECT: `using (is_class_teacher(class_id) or is_linked_parent(child_id))`.
- INSERT/UPDATE: `using (is_class_teacher(class_id)) with check (is_class_teacher(class_id))`.
- DELETE: denied.

### `audit_events`
- SELECT: admin only (or none from client). INSERT/UPDATE/DELETE: service role only.

---

## Cross-cutting RLS rules (the must-haves)

- **Parents read only their linked children** → every child-scoped table guards on
  `is_linked_parent(child_id)`.
- **Teachers read only students in their class** → guards on
  `is_childs_class_teacher(child_id)` / `is_class_teacher(class_id)`.
- **Invitations are managed only by their creator** (`created_by_teacher_id = auth.uid()`)
  within a class they belong to.
- **Approvals only by the linked parent; reviews only by the class teacher.**
- **Submissions visible only to authorized parent/teacher (+ the owning device
  via a scoped server action).**
- **Anon cannot browse any table.** Invitation lookup/registration and child-code
  activation happen ONLY through narrow `SECURITY DEFINER` RPCs that return the
  minimum needed and never a table scan. Add rate limiting.
- **Service role is used ONLY in server-side code** (server actions / Edge
  Functions); it bypasses RLS and must never reach the client bundle.
- **Storage** has its own policies (see storage plan): private bucket, signed
  URLs, path-scoped read/write.
