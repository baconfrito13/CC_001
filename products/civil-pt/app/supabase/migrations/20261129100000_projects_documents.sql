-- Rastoplan: projects, documents and sheets (slice S-03: US-02 and US-03).
--
-- Same model as the ledger functions of the init migration: the application reaches the data
-- only through SECURITY DEFINER functions whose EXECUTE is granted to `service_role` alone, and
-- every function takes the user it acts for, so a route that forgot an ownership check still
-- cannot touch another account's rows (SR-01, T-01). The tables, their RLS policies and the
-- column-level grants already exist (init migration): a browser may read its own rows through
-- PostgREST but writes nothing here.
--
-- Every function returns jsonb (or null) that the app validates with zod
-- (src/lib/data/types.ts); `p_now` is an injectable clock so tests can move time.

-- ---------------------------------------------------------------------------------------
-- Row to jsonb helpers (called only from the functions below)
-- ---------------------------------------------------------------------------------------

create function public.sheet_json(s public.sheets) returns jsonb
language sql stable set search_path = ''
as $$
  select jsonb_build_object(
    'id', s.id,
    'document_id', s.document_id,
    'project_id', s.project_id,
    'page_no', s.page_no,
    'width_pt', s.width_pt,
    'height_pt', s.height_pt,
    'scale_ratio', s.scale_ratio,
    'scale_source', s.scale_source,
    'status', s.status,
    'needs_recalc', s.needs_recalc
  )
$$;

create function public.document_json(d public.documents) returns jsonb
language sql stable set search_path = ''
as $$
  select jsonb_build_object(
    'id', d.id,
    'project_id', d.project_id,
    'file_name', d.file_name,
    'size_bytes', d.size_bytes,
    'page_count', d.page_count,
    'status', d.status,
    'storage_path', d.storage_path,
    'created_at', d.created_at,
    'sheets', coalesce(
      (select jsonb_agg(public.sheet_json(s) order by s.page_no)
         from public.sheets s where s.document_id = d.id),
      '[]'::jsonb)
  )
$$;

-- ---------------------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------------------

create function public.create_project(
  p_user uuid, p_name text, p_now timestamptz default now()
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v public.projects;
begin
  insert into public.projects (user_id, name, created_at, updated_at)
  values (p_user, p_name, p_now, p_now)
  returning * into v;
  return jsonb_build_object('id', v.id, 'name', v.name, 'created_at', v.created_at);
end
$$;

create function public.list_projects(p_user uuid) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'created_at', p.created_at,
      'document_count', (select count(*) from public.documents d
                          where d.project_id = p.id and d.status = 'ready'),
      'sheet_count', (select count(*) from public.sheets s where s.project_id = p.id)
    ) order by p.created_at desc, p.id
  ), '[]'::jsonb)
  from public.projects p
  where p.user_id = p_user
$$;

-- Null when the project does not exist or is not the user's: the caller answers 404 either way.
create function public.get_project(p_user uuid, p_project uuid) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object('id', p.id, 'name', p.name, 'created_at', p.created_at)
  from public.projects p
  where p.id = p_project and p.user_id = p_user
$$;

-- Documents and sheets go with the project (cascade). The caller removes the files first.
create function public.delete_project(p_user uuid, p_project uuid) returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.projects p where p.id = p_project and p.user_id = p_user;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  return jsonb_build_object('ok', true);
end
$$;

-- ---------------------------------------------------------------------------------------
-- Documents (one uploaded PDF) and their sheets (one per page)
-- ---------------------------------------------------------------------------------------

-- The server picks the id and the storage path before calling; the row is `pending_upload`
-- until `finalize_document` runs.
create function public.register_document(
  p_user uuid, p_project uuid, p_document uuid, p_path text, p_file_name text, p_size integer,
  p_now timestamptz default now()
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v public.documents;
begin
  if not exists (
    select 1 from public.projects p where p.id = p_project and p.user_id = p_user
  ) then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  insert into public.documents
    (id, project_id, user_id, storage_path, file_name, size_bytes, created_at, updated_at)
  values (p_document, p_project, p_user, p_path, p_file_name, p_size, p_now, p_now)
  returning * into v;
  return jsonb_build_object('ok', true, 'document', public.document_json(v));
end
$$;

create function public.get_document(p_user uuid, p_document uuid) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select public.document_json(d)
  from public.documents d
  where d.id = p_document and d.user_id = p_user
$$;

create function public.list_documents(p_user uuid, p_project uuid) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(public.document_json(d) order by d.created_at, d.id), '[]'::jsonb)
  from public.documents d
  where d.project_id = p_project and d.user_id = p_user
$$;

-- Creates the sheets and marks the document ready in one transaction, so a failure leaves no
-- partial sheets (US-02 criterion 4). The row lock serialises two finalize calls for the same
-- document; the second one gets the same sheets back (`already`).
create function public.finalize_document(
  p_user uuid, p_document uuid, p_page_count integer, p_sheets jsonb,
  p_now timestamptz default now()
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v public.documents;
begin
  select * into v from public.documents d
  where d.id = p_document and d.user_id = p_user
  for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  if v.status = 'ready' then
    return jsonb_build_object('ok', true, 'already', true, 'document', public.document_json(v));
  end if;
  if v.status <> 'pending_upload' then
    return jsonb_build_object('ok', false, 'reason', 'bad_state');
  end if;

  insert into public.sheets
    (document_id, project_id, user_id, page_no, width_pt, height_pt, scale_ratio, scale_source,
     created_at, updated_at)
  select p_document, v.project_id, p_user, x.page_no, x.width_pt, x.height_pt, x.scale_ratio,
         x.scale_source, p_now, p_now
  from jsonb_to_recordset(p_sheets) as x(
    page_no integer, width_pt numeric, height_pt numeric, scale_ratio integer, scale_source text
  );

  update public.documents d
     set status = 'ready', page_count = p_page_count, updated_at = p_now
   where d.id = p_document
  returning * into v;
  return jsonb_build_object('ok', true, 'already', false, 'document', public.document_json(v));
end
$$;

-- Removes a document that never became ready (rejected, interrupted or stale) and returns the
-- path of the object the caller must delete. Ready documents are never touched by this.
create function public.abandon_document(p_user uuid, p_document uuid) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_path text;
begin
  delete from public.documents d
   where d.id = p_document and d.user_id = p_user and d.status = 'pending_upload'
  returning d.storage_path into v_path;
  if found then
    return jsonb_build_object('ok', true, 'storage_path', v_path);
  end if;
  if exists (select 1 from public.documents d where d.id = p_document and d.user_id = p_user) then
    return jsonb_build_object('ok', false, 'reason', 'not_pending');
  end if;
  return jsonb_build_object('ok', false, 'reason', 'not_found');
end
$$;

-- Maintenance (every user at once): uploads that were never finalized (SR-11, US-02 criterion 4).
create function public.list_stale_pending_documents(
  p_before timestamptz, p_limit integer default 100
) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(
    jsonb_build_object('id', s.id, 'user_id', s.user_id, 'storage_path', s.storage_path)
    order by s.created_at, s.id
  ), '[]'::jsonb)
  from (
    select d.id, d.user_id, d.storage_path, d.created_at
    from public.documents d
    where d.status = 'pending_upload' and d.created_at < p_before
    order by d.created_at, d.id
    limit greatest(p_limit, 0)
  ) s
$$;

-- ---------------------------------------------------------------------------------------
-- Sheets: the scale (US-03)
-- ---------------------------------------------------------------------------------------

create function public.get_sheet(p_user uuid, p_sheet uuid) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select public.sheet_json(s)
  from public.sheets s
  where s.id = p_sheet and s.user_id = p_user
$$;

-- Confirming the detected value keeps source 'detected'; any other choice is 'manual' and
-- prevails. A sheet whose quantities were already computed is flagged `needs_recalc`.
create function public.set_sheet_scale(
  p_user uuid, p_sheet uuid, p_ratio integer, p_now timestamptz default now()
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_old public.sheets;
  v_new public.sheets;
  v_source text;
begin
  select * into v_old from public.sheets s
  where s.id = p_sheet and s.user_id = p_user
  for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  v_source := case
    when v_old.scale_source = 'detected' and v_old.scale_ratio = p_ratio then 'detected'
    else 'manual'
  end;

  update public.sheets s
     set scale_ratio = p_ratio,
         scale_source = v_source,
         needs_recalc = s.needs_recalc
           or (s.status = 'ready' and s.scale_ratio is distinct from p_ratio),
         updated_at = p_now
   where s.id = p_sheet
  returning * into v_new;

  return jsonb_build_object(
    'ok', true,
    'sheet', public.sheet_json(v_new),
    'previous_ratio', v_old.scale_ratio,
    'previous_source', v_old.scale_source
  );
end
$$;

-- ---------------------------------------------------------------------------------------
-- Sign-in support
-- ---------------------------------------------------------------------------------------

-- Is there an account with this email? Used only to apply the "3 new accounts per IP per day"
-- limit before a code is sent; the answer is never shown to the visitor (US-01: the response is
-- the same either way).
create function public.auth_user_exists(p_email text) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from auth.users u where lower(u.email) = lower(btrim(p_email)))
$$;

-- ---------------------------------------------------------------------------------------
-- Function privileges: service_role only (Postgres still grants EXECUTE to PUBLIC on new
-- functions, so it is taken back explicitly, as in the init migration)
-- ---------------------------------------------------------------------------------------

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function
  public.create_project(uuid, text, timestamptz),
  public.list_projects(uuid),
  public.get_project(uuid, uuid),
  public.delete_project(uuid, uuid),
  public.register_document(uuid, uuid, uuid, text, text, integer, timestamptz),
  public.get_document(uuid, uuid),
  public.list_documents(uuid, uuid),
  public.finalize_document(uuid, uuid, integer, jsonb, timestamptz),
  public.abandon_document(uuid, uuid),
  public.list_stale_pending_documents(timestamptz, integer),
  public.get_sheet(uuid, uuid),
  public.set_sheet_scale(uuid, uuid, integer, timestamptz),
  public.auth_user_exists(text)
  to service_role;
