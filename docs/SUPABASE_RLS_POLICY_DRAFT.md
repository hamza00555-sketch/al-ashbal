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

-- C1: does THIS request carry a valid child_device_grant for `child`?
-- The device sends its raw grant token; the server hashes it into the request
-- setting `app.child_grant_hash` (e.g. via a Postgres GUC set by the server
-- action / Edge Function before querying). The grant must belong to the child,
-- be unexpired, and not revoked. This — NOT a client-supplied child_id — is the
-- child/device authorization.
create function has_child_grant(child uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from child_device_grants g
    where g.child_id = child
      and g.revoked_at is null
      and g.expires_at > now()
      and g.grant_token_hash = nullif(current_setting('app.child_grant_hash', true), '')
  );
$$;
-- Convenience: a user OR a granted device may access this child.
create function can_access_child(child uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_linked_parent(child) or is_childs_class_teacher(child) or has_child_grant(child);
$$;
```

> Note: `auth.uid()` is null for anonymous users → all `is_*` helpers return
> false. A device with no valid grant token also fails `has_child_grant`. So an
> anon/ungranted caller is denied everywhere except the explicit anon RPCs below.
> **A client-supplied `child_id` alone never authorizes anything** — the parent
> session (`is_linked_parent`) or the device grant (`has_child_grant`) does.

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
- SELECT: `using (can_access_child(id))` — linked parent OR class teacher OR a
  valid device grant (C1). A bare client-supplied id never qualifies.
- INSERT: via server/RPC during registration (service role). (No open client insert.)
- UPDATE: `using (is_linked_parent(id) or is_childs_class_teacher(id))
  with check (same)` — limited columns (display_name, avatar, age, level). (A
  device grant can read but not rename a child; the linked parent edits.)
- DELETE: denied client-side (soft-delete via status if ever needed).

### `child_device_grants`  **(C1)**
- SELECT: `using (is_linked_parent(child_id) or is_childs_class_teacher(child_id))`
  — a parent/teacher can list/inspect a child's device grants. The granted device
  itself does not browse this table (it holds its raw token locally).
- INSERT: server/RPC only (`activate_child_on_device` redeems a code → inserts a
  grant with `grant_token_hash`). Never a raw client insert.
- UPDATE (revoke): `using (is_linked_parent(child_id) or is_childs_class_teacher(child_id))`
  (set `revoked_at`); plus server bumps `last_used_at`/`expires_at`.
- DELETE: denied client-side.

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

### `child_access_codes`  *(C3: expirable + rotatable)*
- SELECT: `using (is_linked_parent(child_id) or is_childs_class_teacher(child_id))`
  (so a parent can re-show a child's active code). **Anon cannot SELECT.**
- INSERT: server/RPC during registration, or when a parent **regenerates** the
  code (rotation: insert a new active code + set `revoked_at` on the old).
- Activation on a device → `activate_child_on_device(code)` RPC (anon-callable,
  **rate-limited**) checks the code is active (not expired/revoked) and **mints a
  `child_device_grant`** (returns the raw grant token); it does NOT return the
  table. Redeeming a code does not itself grant access — the grant does.
- UPDATE (revoke/rotate): `using (is_linked_parent(child_id))`. DELETE: denied client-side.

### `parent_link_codes`  *(C3: expirable + rotatable, single-consume)*
- SELECT: `using (is_linked_parent(child_id))`. INSERT: server/RPC (or child/parent
  regenerates). Consume via `link_parent_to_child_by_code(code)` RPC (checks active,
  not expired/consumed; sets `consumed_*`). **Anon cannot SELECT.**
- UPDATE (revoke/rotate): server/RPC. DELETE: denied client-side.

### `learning_materials` / `lessons` / `daily_prep` / `assignments`
- SELECT: `using ( is_class_teacher(class_id) or
  exists(select 1 from class_students cs where cs.class_id = <class_id> and
  can_access_child(cs.child_id)) )` — teacher of the class, or a parent/**granted
  device** of a child in the class (C1). (For `lessons`, resolve `class_id` via the
  parent material — or denormalize `class_id` onto `lessons`.)
- INSERT/UPDATE/DELETE: `using (is_class_teacher(class_id)) with check (is_class_teacher(class_id))`
  — only the class teacher authors content.

### `submissions`  **(C1 + C2 + C4)**
- SELECT: `using ( can_access_child(child_id) or teacher_id = auth.uid() )` —
  linked parent, class teacher, OR the child's granted device (C1). No
  client-`child_id`-only access.
- INSERT: via `submit_recording` server action ONLY (validates `can_access_child`
  + the assignment + MIME/size, generates the path, enforces the
  `UNIQUE(child_id, assignment_id)` C2). Not a raw client insert. New rows start
  `state='uploading'` (C4).
- UPDATE: state machine, enforced in the finalize/approve/review RPCs —
  finalize (`uploading`→`pending_parent`) `using (can_access_child(child_id))`;
  parent (`pending_parent`→`pending_teacher`/`rerecord`) `using (is_linked_parent(child_id))`;
  teacher (`pending_teacher`→`accepted`/`rerecord`) `using (teacher_id = auth.uid()
  or is_childs_class_teacher(child_id))`. If a child has **no linked parent**,
  finalize sends straight to `pending_teacher` (C-review note).
- DELETE: denied client-side (orphan/`uploading` cleanup is server/retention only).

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

### `points_ledger`  *(rows reference `submissions.id` via `source_id` when `source_type='submission'`)*
- SELECT: `using (can_access_child(child_id))` — linked parent, class teacher, OR
  granted device (C1).
- INSERT: via server/RPC on teacher review acceptance
  (`with check (is_childs_class_teacher(child_id))`).
- UPDATE/DELETE: denied (append-only).

### `child_progress` (or a VIEW)
- SELECT: `using (can_access_child(child_id))` (C1).
- Writes: server/RPC only (or computed view → no writes).

### `attendance_records`
- SELECT: `using (is_class_teacher(class_id) or is_linked_parent(child_id))`.
- INSERT/UPDATE: `using (is_class_teacher(class_id)) with check (is_class_teacher(class_id))`.
- DELETE: denied.

### `audit_events`
- SELECT: admin only (or none from client). INSERT/UPDATE/DELETE: service role only.

---

## Cross-cutting RLS rules (the must-haves)

- **The child/device path is authorized by `has_child_grant`, NEVER by a
  client-supplied `child_id`** (C1). Child-scoped reads/writes use
  `can_access_child(child_id)` = linked parent OR class teacher OR valid device
  grant. `activeChildId` in localStorage is UI convenience only.
- **Parents read only their linked children** → every child-scoped table guards on
  `is_linked_parent(child_id)` (within `can_access_child`).
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
