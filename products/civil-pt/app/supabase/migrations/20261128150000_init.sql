-- Rastoplan: initial schema (slice S-01).
--
-- Conventions (docs/04-architecture.md section 5): uuid keys; timestamptz in UTC; enums as text
-- plus CHECK; money in minor units; hard deletes; quantities in numeric, never float.
-- Security model (SR-01, SR-02): every table has row level security; policies exist only for the
-- `authenticated` role and always compare the owner column with `(select auth.uid())`; nothing
-- is readable by `anon`; columns the client may change are listed in column-level GRANTs; the
-- sheet ledger (lots and reservations) is changed only by SECURITY DEFINER functions whose
-- EXECUTE is granted to `service_role` alone.
--
-- Cross-tenant integrity is enforced by composite foreign keys `(parent_id, user_id)`, so a row
-- can never point at another user's parent even if a policy were wrong.
--
-- Apply with `supabase db push --linked` (migrations before the app). Tests load
-- supabase/tests/shim.sql first (roles, auth and storage stand-ins).

-- ---------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  locale text not null default 'pt' check (locale in ('en', 'pt')),
  role text not null default 'user' check (role in ('user', 'admin')),
  -- Set by the server on a payment dispute; a frozen account cannot reserve sheets.
  frozen boolean not null default false,
  activated_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120), -- confidential
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);
create index projects_user_created_idx on public.projects (user_id, created_at desc);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  file_name text not null check (char_length(file_name) between 1 and 255), -- confidential
  size_bytes integer not null check (size_bytes > 0),
  page_count integer check (page_count is null or page_count > 0),
  status text not null default 'pending_upload'
    check (status in ('pending_upload', 'ready', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete cascade
);
create index documents_project_idx on public.documents (project_id);
create index documents_pending_idx on public.documents (status, created_at)
  where status = 'pending_upload';

create table public.sheets (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null,
  project_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  page_no integer not null check (page_no > 0),
  width_pt numeric(10, 2) not null check (width_pt > 0),
  height_pt numeric(10, 2) not null check (height_pt > 0),
  scale_ratio integer check (scale_ratio is null or scale_ratio between 1 and 10000),
  scale_source text check (scale_source is null or scale_source in ('detected', 'manual')),
  status text not null default 'uploaded'
    check (status in (
      'uploaded', 'queued', 'processing', 'ready', 'failed', 'unsupported_raster', 'low_diversity'
    )),
  failure_reason text,
  element_count integer check (element_count is null or element_count >= 0),
  style_count integer check (style_count is null or style_count >= 0),
  dominant_share numeric(5, 4) check (dominant_share is null or dominant_share between 0 and 1),
  geometry_path text,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  needs_recalc boolean not null default false,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (document_id, page_no),
  foreign key (document_id, user_id) references public.documents (id, user_id) on delete cascade,
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete cascade
);
create index sheets_queue_idx on public.sheets (status, created_at)
  where status in ('queued', 'processing');
create index sheets_user_status_idx on public.sheets (user_id, status);

create table public.map_nodes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  parent_id uuid,
  kind text not null check (kind in ('chapter', 'article')),
  code text,
  title text not null default '', -- confidential; an article may lack a title until export
  unit text check (unit is null or unit in ('m', 'm2', 'm3', 'un')),
  thickness_m numeric(8, 3) check (thickness_m is null or thickness_m > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete cascade,
  foreign key (parent_id, user_id) references public.map_nodes (id, user_id) on delete cascade
);
create index map_nodes_tree_idx on public.map_nodes (project_id, parent_id, sort_order);

create table public.sheet_groups (
  id uuid primary key default gen_random_uuid(),
  sheet_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  style_key text not null,
  kind text not null check (kind in ('area', 'length')),
  stroke text,
  fill text,
  line_width_pt numeric(8, 3),
  dash text,
  element_count integer not null check (element_count >= 0),
  area_m2 numeric(18, 6),
  perimeter_m numeric(18, 6),
  length_m numeric(18, 6),
  review_state text not null default 'pending'
    check (review_state in ('pending', 'confirmed', 'rejected')),
  article_id uuid references public.map_nodes (id) on delete set null,
  legend_label text,
  created_at timestamptz not null default now(),
  unique (sheet_id, style_key, kind),
  foreign key (sheet_id, user_id) references public.sheets (id, user_id) on delete cascade
);
create index sheet_groups_article_idx on public.sheet_groups (article_id);

create table public.map_exports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  articles integer not null check (articles >= 0),
  chapters integer not null check (chapters >= 0),
  created_at timestamptz not null default now(),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete cascade
);
create index map_exports_user_idx on public.map_exports (user_id, created_at desc);

create table public.trust_checks (
  id uuid primary key default gen_random_uuid(),
  sheet_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  answer text not null check (answer in ('yes', 'almost', 'no')),
  is_sample boolean not null default false,
  confirmed_groups integer not null check (confirmed_groups >= 0),
  created_at timestamptz not null default now(),
  foreign key (sheet_id, user_id) references public.sheets (id, user_id) on delete cascade
);
create index trust_checks_user_idx on public.trust_checks (user_id, created_at);

-- Fiscal retention: a purchase outlives its account (user_id becomes NULL on account deletion).
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  kind text not null check (kind in ('pass', 'subscription')),
  pass_size integer check (pass_size is null or pass_size > 0),
  amount_minor integer not null check (amount_minor >= 0), -- without VAT, in cents
  currency text not null default 'EUR' check (char_length(currency) = 3),
  tax_minor integer not null default 0 check (tax_minor >= 0),
  stripe_ref text not null unique, -- payment_intent or invoice id
  status text not null default 'paid' check (status in ('paid', 'refunded', 'disputed')),
  created_at timestamptz not null default now(),
  check ((kind = 'pass') = (pass_size is not null))
);
create index purchases_user_idx on public.purchases (user_id, created_at desc);

-- A lot is a number of sheets with an expiry and an origin. The ledger stores no balance:
-- balance = sheets_total minus reservations (reserved or committed), over usable lots.
create table public.sheet_lots (
  id uuid primary key default gen_random_uuid(),
  -- Insertion order: the last tie-break when two lots expire and were created at the same instant.
  seq bigint generated always as identity,
  user_id uuid not null references auth.users (id) on delete cascade,
  purchase_id uuid references public.purchases (id) on delete set null,
  origin text not null check (origin in ('trial', 'subscription', 'pass')),
  sheets_total integer not null check (sheets_total >= 0),
  returns_used integer not null default 0 check (returns_used between 0 and 3),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);
create index sheet_lots_user_expiry_idx on public.sheet_lots (user_id, expires_at);
-- One lot per purchase: a replayed webhook cannot grant sheets twice (T-02).
create unique index sheet_lots_purchase_uidx on public.sheet_lots (purchase_id)
  where purchase_id is not null;
-- One trial per account.
create unique index sheet_lots_trial_uidx on public.sheet_lots (user_id) where origin = 'trial';

-- No foreign key to `sheets` on purpose: deleting a project or sheet must not hand the sheet
-- back to the balance (a reservation is consumption history). The ledger functions check that
-- the sheet belongs to the user when they create the reservation.
create table public.sheet_reservations (
  sheet_id uuid primary key,
  lot_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  state text not null check (state in ('reserved', 'committed', 'released')),
  reason text check (reason is null or reason in ('failed', 'raster', 'low_diversity', 'returned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (lot_id, user_id) references public.sheet_lots (id, user_id) on delete cascade
);
create index sheet_reservations_lot_idx on public.sheet_reservations (lot_id, state);

create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_subscription_id text unique,
  plan text not null check (plan in ('independente', 'empresa', 'gabinete')),
  status text not null check (status in ('active', 'past_due', 'canceled')),
  founder_price boolean not null default false,
  current_period_end timestamptz,
  grace_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.billing_customers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now()
);

-- Internal tables: RLS on, no policy, no grant to the API roles (service role only).

create table public.stripe_events (
  id text primary key, -- Stripe event.id: idempotency of the webhook
  type text not null,
  received_at timestamptz not null default now()
);

create table public.rate_limits (
  key text not null check (char_length(key) <= 200),
  window_start timestamptz not null,
  count integer not null default 0 check (count >= 0),
  primary key (key, window_start)
);

-- SR-06: failed login-code attempts per email. `email_hash` is an HMAC computed by the app
-- (HASH_SALT): the table never stores an email address.
create table public.auth_attempts (
  email_hash text primary key,
  failed integer not null default 0 check (failed >= 0),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create table public.signup_ip_daily (
  ip_hash text not null,
  day date not null,
  count integer not null default 0 check (count >= 0),
  primary key (ip_hash, day)
);

-- One trial per normalised email. The hash is a plain SHA-256 of the normalised address.
create table public.trial_grants (
  email_hash text primary key,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor text not null,
  action text not null,
  target text,
  created_at timestamptz not null default now()
);

-- First ten "Empresa" subscribers pay the founder price (US-08 criteria 1 and 2).
create table public.founder_claims (
  user_id uuid primary key references auth.users (id) on delete cascade,
  claimed_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------
-- Row level security: enabled on every table (SR-01)
-- ---------------------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.documents enable row level security;
alter table public.sheets enable row level security;
alter table public.map_nodes enable row level security;
alter table public.sheet_groups enable row level security;
alter table public.map_exports enable row level security;
alter table public.trust_checks enable row level security;
alter table public.purchases enable row level security;
alter table public.sheet_lots enable row level security;
alter table public.sheet_reservations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.billing_customers enable row level security;
alter table public.stripe_events enable row level security;
alter table public.rate_limits enable row level security;
alter table public.auth_attempts enable row level security;
alter table public.signup_ip_daily enable row level security;
alter table public.trial_grants enable row level security;
alter table public.audit_log enable row level security;
alter table public.founder_claims enable row level security;

-- Supabase grants every new table to anon and authenticated by default: take it all back, then
-- grant only what the architecture (section 5.3) allows.
revoke all on table
  public.profiles, public.projects, public.documents, public.sheets, public.map_nodes,
  public.sheet_groups, public.map_exports, public.trust_checks, public.purchases,
  public.sheet_lots, public.sheet_reservations, public.subscriptions, public.billing_customers,
  public.stripe_events, public.rate_limits, public.auth_attempts, public.signup_ip_daily,
  public.trial_grants, public.audit_log, public.founder_claims
  from anon, authenticated;
revoke all on sequence public.audit_log_id_seq, public.sheet_lots_seq_seq from anon, authenticated;

-- profiles: the owner reads; may change only the locale. role and frozen are server-only.
grant select on public.profiles to authenticated;
grant update (locale) on public.profiles to authenticated;
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- projects: full owner access (the server also removes the files when it deletes a project).
grant select, delete on public.projects to authenticated;
grant insert (id, user_id, name) on public.projects to authenticated;
grant update (name) on public.projects to authenticated;
create policy projects_select_own on public.projects
  for select to authenticated using (user_id = (select auth.uid()));
create policy projects_insert_own on public.projects
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy projects_update_own on public.projects
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy projects_delete_own on public.projects
  for delete to authenticated using (user_id = (select auth.uid()));

-- documents, sheets: read-only for the owner; the server decides state and paths.
grant select on public.documents to authenticated;
create policy documents_select_own on public.documents
  for select to authenticated using (user_id = (select auth.uid()));
grant select on public.sheets to authenticated;
create policy sheets_select_own on public.sheets
  for select to authenticated using (user_id = (select auth.uid()));

-- map_nodes: full owner access. The composite foreign keys keep every node inside the
-- owner's own project and tree; columns that define identity are not updatable.
grant select, delete on public.map_nodes to authenticated;
grant insert (id, project_id, user_id, parent_id, kind, code, title, unit, thickness_m, sort_order)
  on public.map_nodes to authenticated;
grant update (parent_id, code, title, unit, thickness_m, sort_order)
  on public.map_nodes to authenticated;
create policy map_nodes_select_own on public.map_nodes
  for select to authenticated using (user_id = (select auth.uid()));
create policy map_nodes_insert_own on public.map_nodes
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy map_nodes_update_own on public.map_nodes
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy map_nodes_delete_own on public.map_nodes
  for delete to authenticated using (user_id = (select auth.uid()));

-- sheet_groups: the owner reads and may change only review_state and article_id; a quantity
-- is never editable. A trigger below keeps article_id inside the sheet's own project.
grant select on public.sheet_groups to authenticated;
grant update (review_state, article_id) on public.sheet_groups to authenticated;
create policy sheet_groups_select_own on public.sheet_groups
  for select to authenticated using (user_id = (select auth.uid()));
create policy sheet_groups_update_own on public.sheet_groups
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- map_exports, trust_checks: computed by the server; the owner reads.
grant select on public.map_exports to authenticated;
create policy map_exports_select_own on public.map_exports
  for select to authenticated using (user_id = (select auth.uid()));
grant select on public.trust_checks to authenticated;
create policy trust_checks_select_own on public.trust_checks
  for select to authenticated using (user_id = (select auth.uid()));

-- Payment state is never the client's: the owner reads, only the server (webhook) writes.
grant select on public.purchases to authenticated;
create policy purchases_select_own on public.purchases
  for select to authenticated using (user_id = (select auth.uid()));
grant select on public.subscriptions to authenticated;
create policy subscriptions_select_own on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()));
grant select on public.billing_customers to authenticated;
create policy billing_customers_select_own on public.billing_customers
  for select to authenticated using (user_id = (select auth.uid()));

-- Ledger: the owner reads; writes only through the SECURITY DEFINER functions below.
grant select on public.sheet_lots to authenticated;
create policy sheet_lots_select_own on public.sheet_lots
  for select to authenticated using (user_id = (select auth.uid()));
grant select on public.sheet_reservations to authenticated;
create policy sheet_reservations_select_own on public.sheet_reservations
  for select to authenticated using (user_id = (select auth.uid()));

-- Balance per lot for the account page (the client reads it through PostgREST under RLS).
create view public.sheet_lot_balances with (security_invoker = true) as
  select
    l.id as lot_id,
    l.seq,
    l.user_id,
    l.origin,
    l.sheets_total,
    count(r.sheet_id) filter (where r.state in ('reserved', 'committed'))::integer as used,
    (l.sheets_total
      - count(r.sheet_id) filter (where r.state in ('reserved', 'committed')))::integer as remaining,
    l.expires_at,
    l.revoked_at,
    l.created_at
  from public.sheet_lots l
  left join public.sheet_reservations r on r.lot_id = l.id
  group by l.id;
revoke all on public.sheet_lot_balances from anon, authenticated;
grant select on public.sheet_lot_balances to authenticated;

-- ---------------------------------------------------------------------------------------
-- Storage buckets (private) and policies. Uploads use signed URLs created by the server.
-- ---------------------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('uploads', 'uploads', false, 52428800, array['application/pdf']),
  ('geometry', 'geometry', false, 52428800, null)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- The owner reads files under their own folder (`<user id>/...`); nobody writes or deletes
-- through the API: the server does, with the service role.
create policy uploads_select_own on storage.objects
  for select to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy geometry_select_own on storage.objects
  for select to authenticated
  using (bucket_id = 'geometry' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ---------------------------------------------------------------------------------------
-- Helpers and triggers
-- ---------------------------------------------------------------------------------------

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();
create trigger documents_touch before update on public.documents
  for each row execute function public.touch_updated_at();
create trigger sheets_touch before update on public.sheets
  for each row execute function public.touch_updated_at();
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- A group may only be assigned to an article of the same project, owned by the same user.
create function public.check_group_article() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.article_id is null then
    return new;
  end if;
  if not exists (
    select 1
    from public.map_nodes n
    join public.sheets s on s.id = new.sheet_id
    where n.id = new.article_id
      and n.kind = 'article'
      and n.user_id = new.user_id
      and n.project_id = s.project_id
  ) then
    raise exception 'article_not_in_project' using errcode = '23514';
  end if;
  return new;
end
$$;

create trigger sheet_groups_check_article before insert or update of article_id
  on public.sheet_groups
  for each row execute function public.check_group_article();

-- Same normalisation as src/lib/core/email.ts (a test keeps them identical): lower case, no
-- "+tag", no dots in Gmail local parts, googlemail.com = gmail.com.
create function public.normalize_email(p_email text) returns text
language plpgsql immutable set search_path = ''
as $$
declare
  v_email text := lower(btrim(p_email));
  v_local text := split_part(v_email, '@', 1);
  v_domain text := split_part(v_email, '@', 2);
  v_stripped text;
begin
  if v_domain = 'googlemail.com' then
    v_domain := 'gmail.com';
  end if;
  v_stripped := split_part(v_local, '+', 1);
  if v_stripped <> '' then
    v_local := v_stripped;
  end if;
  if v_domain = 'gmail.com' then
    v_local := replace(v_local, '.', '');
  end if;
  return v_local || '@' || v_domain;
end
$$;

-- ---------------------------------------------------------------------------------------
-- Ledger functions (SECURITY DEFINER; EXECUTE for service_role only: SR-02)
-- All take an injectable clock `p_now` so tests can move time. They return jsonb objects the
-- app validates with zod (src/lib/data/types.ts).
-- ---------------------------------------------------------------------------------------

-- Reserve one sheet from the lot that expires first (ties: the oldest lot, then the first created). Idempotent per
-- sheet: a sheet already reserved or committed is charged once. Every mutation of one user's
-- ledger first takes that user's profile row lock, so concurrent reserves queue (SR-02).
create function public.reserve_sheet(
  p_user uuid, p_sheet uuid, p_now timestamptz default now()
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_frozen boolean;
  v_res public.sheet_reservations;
  v_lot uuid;
begin
  select p.frozen into v_frozen from public.profiles p where p.id = p_user for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  if not exists (select 1 from public.sheets s where s.id = p_sheet and s.user_id = p_user) then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  select * into v_res from public.sheet_reservations r where r.sheet_id = p_sheet;
  if v_res.sheet_id is not null and v_res.state in ('reserved', 'committed') then
    return jsonb_build_object('ok', true, 'already', true, 'lot_id', v_res.lot_id);
  end if;
  if v_frozen then
    return jsonb_build_object('ok', false, 'reason', 'frozen');
  end if;

  select l.id into v_lot
  from public.sheet_lots l
  where l.user_id = p_user
    and l.revoked_at is null
    and l.expires_at > p_now
    and l.sheets_total > (
      select count(*) from public.sheet_reservations r
      where r.lot_id = l.id and r.state in ('reserved', 'committed')
    )
  order by l.expires_at asc, l.created_at asc, l.seq asc
  limit 1;
  if v_lot is null then
    return jsonb_build_object('ok', false, 'reason', 'no_balance');
  end if;

  if v_res.sheet_id is not null then
    update public.sheet_reservations
      set lot_id = v_lot, state = 'reserved', reason = null, updated_at = p_now
      where sheet_id = p_sheet;
  else
    insert into public.sheet_reservations (sheet_id, lot_id, user_id, state, created_at, updated_at)
      values (p_sheet, v_lot, p_user, 'reserved', p_now, p_now);
  end if;
  return jsonb_build_object('ok', true, 'already', false, 'lot_id', v_lot);
end
$$;

-- A reserved sheet becomes consumed for good (processing succeeded).
create function public.commit_sheet(p_sheet uuid, p_now timestamptz default now()) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_state text;
begin
  update public.sheet_reservations
    set state = 'committed', updated_at = p_now
    where sheet_id = p_sheet and state = 'reserved';
  if found then
    return jsonb_build_object('ok', true, 'already', false);
  end if;
  select r.state into v_state from public.sheet_reservations r where r.sheet_id = p_sheet;
  if v_state = 'committed' then
    return jsonb_build_object('ok', true, 'already', true);
  end if;
  return jsonb_build_object('ok', false, 'reason', 'not_reserved');
end
$$;

-- Give the sheet back. Reasons failed, raster and low_diversity release a reservation made
-- for a sheet that did not produce a result. `returned` (the user says "it did not work")
-- gives back a committed sheet, at most 3 times per lot.
create function public.release_sheet(
  p_sheet uuid, p_reason text, p_now timestamptz default now()
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_res public.sheet_reservations;
  v_lot uuid;
begin
  if p_reason is null or p_reason not in ('failed', 'raster', 'low_diversity', 'returned') then
    raise exception 'invalid_release_reason' using errcode = '22023';
  end if;

  select * into v_res from public.sheet_reservations r where r.sheet_id = p_sheet for update;
  if v_res.sheet_id is null then
    return jsonb_build_object('ok', false, 'reason', 'not_reserved');
  end if;
  if v_res.state = 'released' then
    return jsonb_build_object('ok', true, 'already', true);
  end if;

  if p_reason = 'returned' then
    if v_res.state <> 'committed' then
      return jsonb_build_object('ok', false, 'reason', 'not_committed');
    end if;
    -- One statement: the row lock makes the limit of 3 hold under concurrency.
    update public.sheet_lots
      set returns_used = returns_used + 1
      where id = v_res.lot_id and returns_used < 3
      returning id into v_lot;
    if v_lot is null then
      return jsonb_build_object('ok', false, 'reason', 'return_limit');
    end if;
  elsif v_res.state <> 'reserved' then
    return jsonb_build_object('ok', false, 'reason', 'already_committed');
  end if;

  update public.sheet_reservations
    set state = 'released', reason = p_reason, updated_at = p_now
    where sheet_id = p_sheet;
  return jsonb_build_object('ok', true, 'already', false);
end
$$;

-- Create a lot for a subscription period or a pass. With a purchase it is idempotent: the
-- same purchase never yields a second lot (replayed webhooks).
create function public.grant_lot(
  p_user uuid, p_origin text, p_sheets integer, p_expires_at timestamptz,
  p_purchase uuid default null, p_now timestamptz default now()
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_lot uuid;
begin
  if p_origin is null or p_origin not in ('subscription', 'pass') then
    raise exception 'invalid_lot_origin' using errcode = '22023';
  end if;
  if p_sheets is null or p_sheets <= 0 then
    raise exception 'invalid_lot_size' using errcode = '22023';
  end if;

  insert into public.sheet_lots (user_id, purchase_id, origin, sheets_total, expires_at, created_at)
    values (p_user, p_purchase, p_origin, p_sheets, p_expires_at, p_now)
    on conflict (purchase_id) where purchase_id is not null do nothing
    returning id into v_lot;
  if v_lot is not null then
    return jsonb_build_object('lot_id', v_lot, 'created', true);
  end if;
  select l.id into v_lot from public.sheet_lots l where l.purchase_id = p_purchase;
  return jsonb_build_object('lot_id', v_lot, 'created', false);
end
$$;

-- Revoke the unused sheets of a lot (refund): the lot shrinks to the sheets already used, so
-- used sheets stay used and the balance can never go negative.
create function public.revoke_lot(p_lot uuid, p_now timestamptz default now()) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid;
  v_lot public.sheet_lots;
  v_used integer;
begin
  select l.user_id into v_user from public.sheet_lots l where l.id = p_lot;
  if v_user is null then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  perform 1 from public.profiles p where p.id = v_user for update;
  select * into v_lot from public.sheet_lots l where l.id = p_lot for update;
  select count(*)::integer into v_used from public.sheet_reservations r
    where r.lot_id = p_lot and r.state in ('reserved', 'committed');
  if v_lot.revoked_at is not null then
    return jsonb_build_object('ok', true, 'already', true, 'kept_used', v_lot.sheets_total);
  end if;
  update public.sheet_lots set sheets_total = v_used, revoked_at = p_now where id = p_lot;
  return jsonb_build_object('ok', true, 'already', false, 'kept_used', v_used);
end
$$;

-- Usable balance at `p_now`: lots that are not revoked, not expired and have sheets left.
create function public.ledger_balance(p_user uuid, p_now timestamptz default now()) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'available', coalesce(sum(b.remaining), 0)::integer,
    'frozen', coalesce((select p.frozen from public.profiles p where p.id = p_user), false),
    'lots', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'lot_id', b.lot_id, 'origin', b.origin,
          'remaining', b.remaining, 'expires_at', b.expires_at
        ) order by b.expires_at, b.created_at, b.seq
      ),
      '[]'::jsonb
    )
  )
  from public.sheet_lot_balances b
  where b.user_id = p_user
    and b.revoked_at is null
    and b.expires_at > p_now
    and b.remaining > 0
$$;

-- Trial: 5 sheets for 14 days, once per normalised email (US-08 criterion 6).
create function public.grant_trial(
  p_user uuid, p_email text, p_sheets integer, p_days integer, p_now timestamptz default now()
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_hash text := encode(sha256(convert_to(public.normalize_email(p_email), 'UTF8')), 'hex');
  v_rows integer;
  v_lot uuid;
begin
  insert into public.trial_grants (email_hash, user_id, created_at)
    values (v_hash, p_user, p_now)
    on conflict (email_hash) do nothing;
  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    return jsonb_build_object('granted', false, 'reason', 'already_used');
  end if;
  insert into public.sheet_lots (user_id, origin, sheets_total, expires_at, created_at)
    values (p_user, 'trial', p_sheets, p_now + make_interval(days => p_days), p_now)
    returning id into v_lot;
  return jsonb_build_object('granted', true, 'lot_id', v_lot);
end
$$;

-- Founder price: atomic, capped at p_slots claims (US-08 criteria 1 and 2). Idempotent per user.
create function public.try_founder_price(p_user uuid, p_slots integer) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended('rastoplan:founder_price', 0));
  if exists (select 1 from public.founder_claims c where c.user_id = p_user) then
    return jsonb_build_object('granted', true, 'already', true);
  end if;
  select count(*)::integer into v_count from public.founder_claims;
  if v_count >= p_slots then
    return jsonb_build_object('granted', false, 'already', false);
  end if;
  insert into public.founder_claims (user_id) values (p_user);
  return jsonb_build_object('granted', true, 'already', false);
end
$$;

-- Fixed-window counter: counts hits per key and window; `allowed` while count <= limit.
create function public.rl_hit(
  p_key text, p_limit integer, p_window_seconds integer, p_now timestamptz default now()
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_start timestamptz;
  v_count integer;
begin
  if p_window_seconds <= 0 or p_limit < 0 then
    raise exception 'invalid_rate_limit' using errcode = '22023';
  end if;
  v_start := to_timestamp(floor(extract(epoch from p_now) / p_window_seconds) * p_window_seconds);
  insert into public.rate_limits as r (key, window_start, count)
    values (p_key, v_start, 1)
    on conflict (key, window_start) do update set count = r.count + 1
    returning r.count into v_count;
  return jsonb_build_object(
    'allowed', v_count <= p_limit,
    'count', v_count,
    'remaining', greatest(p_limit - v_count, 0),
    'reset_at', v_start + make_interval(secs => p_window_seconds)
  );
end
$$;

-- SR-06: login-code attempts. The 5th failure locks the email for 15 minutes and reports
-- `just_locked` once, so the caller rotates the active code. A failure while locked changes
-- nothing; when the lock has expired the count starts again.
create function public.auth_attempt_status(
  p_email_hash text, p_now timestamptz default now()
) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_row public.auth_attempts;
begin
  select * into v_row from public.auth_attempts a where a.email_hash = p_email_hash;
  if v_row.email_hash is null then
    return jsonb_build_object('locked', false, 'failed', 0, 'locked_until', null);
  end if;
  if v_row.locked_until is not null and v_row.locked_until > p_now then
    return jsonb_build_object('locked', true, 'failed', v_row.failed, 'locked_until', v_row.locked_until);
  end if;
  if v_row.locked_until is not null then
    return jsonb_build_object('locked', false, 'failed', 0, 'locked_until', null);
  end if;
  return jsonb_build_object('locked', false, 'failed', v_row.failed, 'locked_until', null);
end
$$;

create function public.auth_attempt_failed(
  p_email_hash text, p_now timestamptz default now(),
  p_max integer default 5, p_lock_seconds integer default 900
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_row public.auth_attempts;
  v_failed integer;
  v_locked_until timestamptz;
begin
  insert into public.auth_attempts (email_hash, failed, updated_at)
    values (p_email_hash, 0, p_now)
    on conflict (email_hash) do nothing;
  select * into v_row from public.auth_attempts a where a.email_hash = p_email_hash for update;

  if v_row.locked_until is not null and v_row.locked_until > p_now then
    return jsonb_build_object(
      'locked', true, 'just_locked', false, 'failed', v_row.failed, 'locked_until', v_row.locked_until
    );
  end if;

  v_failed := case when v_row.locked_until is not null then 1 else v_row.failed + 1 end;
  if v_failed >= p_max then
    v_locked_until := p_now + make_interval(secs => p_lock_seconds);
  end if;
  update public.auth_attempts
    set failed = v_failed, locked_until = v_locked_until, updated_at = p_now
    where email_hash = p_email_hash;
  return jsonb_build_object(
    'locked', v_locked_until is not null,
    'just_locked', v_locked_until is not null,
    'failed', v_failed,
    'locked_until', v_locked_until
  );
end
$$;

create function public.auth_attempt_reset(p_email_hash text) returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.auth_attempts where email_hash = p_email_hash;
  return jsonb_build_object('ok', true);
end
$$;

-- Health check: proves the database answers through the same path the app uses.
create function public.db_ping() returns boolean
language sql stable security definer set search_path = ''
as $$ select true $$;

-- ---------------------------------------------------------------------------------------
-- Auth triggers: a profile and a trial for every new account
-- ---------------------------------------------------------------------------------------

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end
$$;

-- Defaults mirror TRIAL_SHEETS=5 and TRIAL_DAYS=14; a project can override them with the
-- database settings app.trial_sheets and app.trial_days.
create function public.trial_grant_for_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.email is null then
    return new;
  end if;
  perform public.grant_trial(
    new.id,
    new.email,
    coalesce(nullif(current_setting('app.trial_sheets', true), '')::integer, 5),
    coalesce(nullif(current_setting('app.trial_days', true), '')::integer, 14),
    now()
  );
  return new;
exception when others then
  -- A problem with the trial (a bad app.trial_* setting, say) must never stop someone from
  -- creating an account: the account is made without a trial and the cause is logged by
  -- Postgres. Support can grant the sheets afterwards.
  raise warning 'trial grant failed for a new account (sqlstate %)', sqlstate;
  return new;
end
$$;

-- Triggers fire in name order: the profile first, then the trial.
create trigger auth_users_after_insert_1_profile after insert on auth.users
  for each row execute function public.handle_new_user();
create trigger auth_users_after_insert_2_trial after insert on auth.users
  for each row execute function public.trial_grant_for_new_user();

-- ---------------------------------------------------------------------------------------
-- Function privileges: nothing in `public` is callable by the API roles (SR-02)
-- ---------------------------------------------------------------------------------------

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function
  public.reserve_sheet(uuid, uuid, timestamptz),
  public.commit_sheet(uuid, timestamptz),
  public.release_sheet(uuid, text, timestamptz),
  public.grant_lot(uuid, text, integer, timestamptz, uuid, timestamptz),
  public.revoke_lot(uuid, timestamptz),
  public.ledger_balance(uuid, timestamptz),
  public.grant_trial(uuid, text, integer, integer, timestamptz),
  public.try_founder_price(uuid, integer),
  public.rl_hit(text, integer, integer, timestamptz),
  public.auth_attempt_status(text, timestamptz),
  public.auth_attempt_failed(text, timestamptz, integer, integer),
  public.auth_attempt_reset(text),
  public.db_ping()
  to service_role;

-- Functions created later by this role are not handed to the API roles (a test lists every
-- function in `public` and fails if one is executable by anon or authenticated; Postgres
-- still grants EXECUTE to PUBLIC on new functions, so a later migration must also
-- `revoke execute ... from public`).
alter default privileges in schema public revoke execute on functions from anon, authenticated;
