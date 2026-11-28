import { readFileSync } from "node:fs";
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type ApiRole, asRole, createMigratedDb, SEED_SQL_PATH } from "../support/pglite";

/**
 * SR-01: row level security on every table, with an A-cannot-read-B test per table and per
 * bucket. The matrix below is the executable form of docs/04-architecture.md section 5.3:
 * what an authenticated user may do through the API. A table missing from it fails the
 * coverage test, so a new table cannot ship without its isolation tests.
 *
 * Accounts: ANA (A) and BRUNO (B) from the demo seed, plus the extra rows added in beforeAll
 * so that both own something in every user-owned table.
 */

const ANA = "a1000000-0000-4000-8000-000000000001";
const BRUNO = "a1000000-0000-4000-8000-000000000002";
const ANA_PROJECT_1 = "b1000000-0000-4000-8000-000000000001";
const ANA_PROJECT_2 = "b1000000-0000-4000-8000-000000000002";
const BRUNO_PROJECT = "b1000000-0000-4000-8000-000000000003";
const ANA_SHEET = "d1000000-0000-4000-8000-000000000001";
const ANA_GROUP = "e1000000-0000-4000-8000-000000000001";
const BRUNO_ARTICLE = "f1000000-0000-4000-8000-000000000002";
const ANA_ARTICLE = "f2000000-0000-4000-8000-000000000002";
const ANA_ARTICLE_OTHER_PROJECT = "f2000000-0000-4000-8000-000000000004";

interface Spec {
  table: string;
  /** Column that holds the owner. */
  owner: string;
  /** May an authenticated user read their own rows? */
  read: boolean;
  /** Does the API role have any INSERT privilege? */
  insert: boolean;
  /** Columns the API role may update (empty: none). */
  updatable: string[];
  delete: boolean;
  /** A column to touch when probing UPDATE. */
  probe: string;
}

const server = { insert: false, updatable: [], delete: false } as const;

const SPECS: Spec[] = [
  {
    table: "profiles",
    owner: "id",
    read: true,
    ...server,
    updatable: ["locale"],
    probe: "role",
  },
  {
    table: "projects",
    owner: "user_id",
    read: true,
    insert: true,
    updatable: ["name"],
    delete: true,
    probe: "name",
  },
  { table: "documents", owner: "user_id", read: true, ...server, probe: "file_name" },
  { table: "sheets", owner: "user_id", read: true, ...server, probe: "status" },
  {
    table: "map_nodes",
    owner: "user_id",
    read: true,
    insert: true,
    updatable: ["title"],
    delete: true,
    probe: "title",
  },
  {
    table: "sheet_groups",
    owner: "user_id",
    read: true,
    ...server,
    updatable: ["review_state"],
    probe: "review_state",
  },
  { table: "map_exports", owner: "user_id", read: true, ...server, probe: "articles" },
  { table: "trust_checks", owner: "user_id", read: true, ...server, probe: "answer" },
  { table: "purchases", owner: "user_id", read: true, ...server, probe: "status" },
  { table: "sheet_lots", owner: "user_id", read: true, ...server, probe: "sheets_total" },
  {
    table: "sheet_reservations",
    owner: "user_id",
    read: true,
    ...server,
    probe: "state",
  },
  { table: "subscriptions", owner: "user_id", read: true, ...server, probe: "status" },
  {
    table: "billing_customers",
    owner: "user_id",
    read: true,
    ...server,
    probe: "stripe_customer_id",
  },
  // Internal tables: no policy, no grant: the service role only.
  { table: "stripe_events", owner: "id", read: false, ...server, probe: "type" },
  { table: "rate_limits", owner: "key", read: false, ...server, probe: "count" },
  {
    table: "auth_attempts",
    owner: "email_hash",
    read: false,
    ...server,
    probe: "failed",
  },
  { table: "signup_ip_daily", owner: "ip_hash", read: false, ...server, probe: "count" },
  {
    table: "trial_grants",
    owner: "user_id",
    read: false,
    ...server,
    probe: "email_hash",
  },
  { table: "audit_log", owner: "actor", read: false, ...server, probe: "action" },
  {
    table: "founder_claims",
    owner: "user_id",
    read: false,
    ...server,
    probe: "claimed_at",
  },
];

/** The functions the API roles must never be able to call. */
const SERVICE_FUNCTIONS = [
  "reserve_sheet",
  "commit_sheet",
  "release_sheet",
  "grant_lot",
  "revoke_lot",
  "ledger_balance",
  "grant_trial",
  "try_founder_price",
  "rl_hit",
  "auth_attempt_status",
  "auth_attempt_failed",
  "auth_attempt_reset",
  "db_ping",
];

let db: PGlite;

type Outcome =
  | { ok: true; rows: Record<string, unknown>[]; affected: number }
  | { ok: false; error: string };

async function attempt(
  role: ApiRole,
  userId: string | null,
  sql: string,
  params: unknown[] = [],
): Promise<Outcome> {
  try {
    const result = await asRole(db, role, userId, (tx) =>
      tx.query<Record<string, unknown>>(sql, params),
    );
    return { ok: true, rows: result.rows, affected: result.affectedRows ?? 0 };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

const count = async (sql: string, params: unknown[] = []) =>
  Number((await db.query<{ n: string }>(sql, params)).rows[0]?.n);

beforeAll(async () => {
  db = await createMigratedDb();
  await db.exec(readFileSync(SEED_SQL_PATH, "utf8"));
  // Both accounts must own rows in every user-owned table (the seed is uneven on purpose).
  await db.exec(`
    insert into public.map_nodes (id, project_id, user_id, parent_id, kind, code, title, unit) values
      ('f2000000-0000-4000-8000-000000000001', '${ANA_PROJECT_1}', '${ANA}', null, 'chapter', '01', 'Cap', null),
      ('${ANA_ARTICLE}', '${ANA_PROJECT_1}', '${ANA}', 'f2000000-0000-4000-8000-000000000001', 'article', '01.01', 'Art', 'm2'),
      ('f2000000-0000-4000-8000-000000000003', '${ANA_PROJECT_2}', '${ANA}', null, 'chapter', '01', 'Cap 2', null),
      ('${ANA_ARTICLE_OTHER_PROJECT}', '${ANA_PROJECT_2}', '${ANA}', 'f2000000-0000-4000-8000-000000000003', 'article', '01.01', 'Art 2', 'm2');
    insert into public.map_exports (project_id, user_id, articles, chapters) values
      ('${ANA_PROJECT_1}', '${ANA}', 1, 1), ('${BRUNO_PROJECT}', '${BRUNO}', 1, 1);
    insert into public.trust_checks (sheet_id, user_id, answer, confirmed_groups) values
      ('${ANA_SHEET}', '${ANA}', 'almost', 3);
    insert into public.purchases (user_id, kind, pass_size, amount_minor, stripe_ref) values
      ('${ANA}', 'pass', 20, 5900, 'pi_rls_ana');
    insert into public.subscriptions (user_id, stripe_subscription_id, plan, status) values
      ('${ANA}', 'sub_rls_ana', 'gabinete', 'active'),
      ('${BRUNO}', 'sub_rls_bruno', 'independente', 'active');
    insert into public.billing_customers (user_id, stripe_customer_id) values
      ('${ANA}', 'cus_rls_ana'), ('${BRUNO}', 'cus_rls_bruno');
    insert into public.stripe_events (id, type) values ('evt_rls_1', 'invoice.paid');
    insert into public.rate_limits (key, window_start, count) values ('rls', now(), 1);
    insert into public.auth_attempts (email_hash, failed) values ('rls-hash', 2);
    insert into public.signup_ip_daily (ip_hash, day, count) values ('rls-ip', current_date, 1);
    insert into public.audit_log (actor, action, target) values ('service:test', 'grant', 'x');
    insert into public.founder_claims (user_id) values ('${ANA}') on conflict do nothing;
    insert into storage.objects (bucket_id, name) values
      ('uploads', '${ANA}/${ANA_PROJECT_1}/a.pdf'),
      ('uploads', '${BRUNO}/${BRUNO_PROJECT}/b.pdf'),
      ('geometry', '${ANA}/${ANA_PROJECT_1}/a.json'),
      ('geometry', '${BRUNO}/${BRUNO_PROJECT}/b.json');
  `);
});

afterAll(async () => {
  await db.close();
});

describe("SR-01: structure", () => {
  it("every table of the public schema is covered by the matrix above", async () => {
    const { rows } = await db.query<{ tablename: string }>(
      "select tablename from pg_tables where schemaname = 'public' order by 1",
    );
    expect(rows.map((r) => r.tablename).sort()).toEqual(SPECS.map((s) => s.table).sort());
  });

  it("SR-01: row level security is enabled on every public table", async () => {
    const { rows } = await db.query<{ tablename: string; rowsecurity: boolean }>(
      "select tablename, rowsecurity from pg_tables where schemaname = 'public'",
    );
    expect(rows.length).toBe(SPECS.length);
    expect(rows.filter((r) => !r.rowsecurity).map((r) => r.tablename)).toEqual([]);
  });

  it("SR-01: no policy uses (true) or reaches anon or PUBLIC", async () => {
    const { rows } = await db.query<{
      tablename: string;
      policyname: string;
      roles: string[];
      qual: string | null;
      with_check: string | null;
    }>("select tablename, policyname, roles, qual, with_check from pg_policies");
    expect(rows.length).toBeGreaterThan(10);
    for (const policy of rows) {
      expect(policy.roles, `${policy.tablename}.${policy.policyname}`).toEqual([
        "authenticated",
      ]);
      expect(policy.qual, `${policy.tablename}.${policy.policyname}`).not.toBe("true");
      expect(policy.with_check, `${policy.tablename}.${policy.policyname}`).not.toBe(
        "true",
      );
      // every policy ties the row to the caller
      expect(
        `${policy.qual ?? ""} ${policy.with_check ?? ""}`,
        policy.policyname,
      ).toMatch(/auth\.uid\(\)/);
    }
  });

  it("SR-01: the privileges of the API roles are exactly the matrix, and anon has none", async () => {
    for (const spec of SPECS) {
      const t = `public.${spec.table}`;
      const priv = async (role: string, p: string, any = false) =>
        (
          await db.query<{ ok: boolean }>(
            `select ${any ? "has_any_column_privilege" : "has_table_privilege"}($1, $2, $3) as ok`,
            [role, t, p],
          )
        ).rows[0]?.ok;
      for (const p of [
        "SELECT",
        "INSERT",
        "UPDATE",
        "DELETE",
        "TRUNCATE",
        "REFERENCES",
        "TRIGGER",
      ]) {
        expect(
          await priv("anon", p, p === "INSERT" || p === "UPDATE"),
          `anon ${p} ${t}`,
        ).toBe(false);
      }
      expect(await priv("authenticated", "SELECT"), `select ${t}`).toBe(spec.read);
      expect(await priv("authenticated", "INSERT", true), `insert ${t}`).toBe(
        spec.insert,
      );
      expect(await priv("authenticated", "UPDATE", true), `update ${t}`).toBe(
        spec.updatable.length > 0,
      );
      expect(await priv("authenticated", "DELETE"), `delete ${t}`).toBe(spec.delete);
      for (const p of ["TRUNCATE", "REFERENCES", "TRIGGER"]) {
        expect(await priv("authenticated", p), `${p} ${t}`).toBe(false);
      }
    }
  });

  it("SR-02: no function of the public schema is executable by anon or authenticated", async () => {
    const { rows } = await db.query<{
      proname: string;
      anon: boolean;
      auth: boolean;
      svc: boolean;
    }>(`
      select p.proname,
             has_function_privilege('anon', p.oid, 'execute') as anon,
             has_function_privilege('authenticated', p.oid, 'execute') as auth,
             has_function_privilege('service_role', p.oid, 'execute') as svc
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'`);
    expect(rows.length).toBeGreaterThanOrEqual(SERVICE_FUNCTIONS.length);
    for (const fn of rows) {
      expect(fn.anon, `anon can run ${fn.proname}`).toBe(false);
      expect(fn.auth, `authenticated can run ${fn.proname}`).toBe(false);
    }
    for (const name of SERVICE_FUNCTIONS) {
      expect(rows.find((r) => r.proname === name)?.svc, `service_role runs ${name}`).toBe(
        true,
      );
    }
  });

  it("no sequence of the public schema is usable by anon or authenticated", async () => {
    const { rows } = await db.query<{ relname: string; anon: boolean; auth: boolean }>(`
      select c.relname,
             has_sequence_privilege('anon', c.oid, 'usage') as anon,
             has_sequence_privilege('authenticated', c.oid, 'usage') as auth
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'S'`);
    expect(rows.length).toBeGreaterThan(0);
    for (const sequence of rows) {
      expect(sequence.anon, `anon ${sequence.relname}`).toBe(false);
      expect(sequence.auth, `authenticated ${sequence.relname}`).toBe(false);
    }
  });

  it("the balance view runs with the caller's rights", async () => {
    const { rows } = await db.query<{ reloptions: string[] | null }>(
      "select reloptions from pg_class where relname = 'sheet_lot_balances'",
    );
    expect(rows[0]?.reloptions).toContain("security_invoker=true");
  });

  it("the storage buckets are private, PDF-only for uploads and capped at 50 MB", async () => {
    const { rows } = await db.query<{
      id: string;
      public: boolean;
      file_size_limit: string;
      allowed_mime_types: string[] | null;
    }>(
      "select id, public, file_size_limit, allowed_mime_types from storage.buckets order by id",
    );
    expect(rows.map((r) => r.id)).toEqual(["geometry", "uploads"]);
    expect(rows.every((r) => r.public === false)).toBe(true);
    const uploads = rows.find((r) => r.id === "uploads");
    expect(Number(uploads?.file_size_limit)).toBe(50 * 1024 * 1024);
    expect(uploads?.allowed_mime_types).toEqual(["application/pdf"]);
  });
});

describe.each(SPECS)("SR-01: $table", (spec) => {
  const owned = (userId: string) =>
    count(
      `select count(*) as n from public.${spec.table} where ${spec.owner}::text = $1`,
      [userId],
    );

  it("both accounts own rows, so the isolation checks are not vacuous", async () => {
    if (spec.table === "profiles" || spec.read) {
      expect(await owned(ANA)).toBeGreaterThan(0);
      expect(await owned(BRUNO)).toBeGreaterThan(0);
    } else {
      expect(
        await count(`select count(*) as n from public.${spec.table}`),
      ).toBeGreaterThan(0);
    }
  });

  it("anon sees nothing", async () => {
    const result = await attempt("anon", null, `select * from public.${spec.table}`);
    if (result.ok) expect(result.rows).toEqual([]);
    else expect(result.error).toMatch(/permission denied/);
  });

  it(
    spec.read
      ? "user A reads only A's rows and none of B's"
      : "user A cannot read the table at all",
    async () => {
      const result = await attempt(
        "authenticated",
        ANA,
        `select ${spec.owner}::text as owner from public.${spec.table}`,
      );
      if (!spec.read) {
        expect(result.ok).toBe(false);
        expect((result as { error: string }).error).toMatch(/permission denied/);
        return;
      }
      expect(result.ok).toBe(true);
      const rows = (result as { rows: { owner: string }[] }).rows;
      expect(rows.length).toBe(await owned(ANA));
      expect(rows.every((r) => r.owner === ANA)).toBe(true);
      expect(rows.some((r) => r.owner === BRUNO)).toBe(false);
    },
  );

  it("user B reads only B's rows (the same check from the other side)", async () => {
    if (!spec.read) return;
    const result = await attempt(
      "authenticated",
      BRUNO,
      `select ${spec.owner}::text as owner from public.${spec.table}`,
    );
    expect(result.ok).toBe(true);
    const rows = (result as { rows: { owner: string }[] }).rows;
    expect(rows.length).toBe(await owned(BRUNO));
    expect(rows.every((r) => r.owner === BRUNO)).toBe(true);
  });

  it("user A cannot update B's rows", async () => {
    const column = spec.updatable[0] ?? spec.probe;
    const before = await owned(BRUNO);
    const result = await attempt(
      "authenticated",
      ANA,
      `update public.${spec.table} set ${column} = ${column} where ${spec.owner}::text = $1`,
      [BRUNO],
    );
    if (spec.updatable.length > 0) {
      expect(result.ok).toBe(true);
      expect((result as { affected: number }).affected).toBe(0);
    } else {
      expect(result.ok).toBe(false);
      expect((result as { error: string }).error).toMatch(/permission denied/);
    }
    expect(await owned(BRUNO)).toBe(before);
  });

  it("user A cannot delete B's rows", async () => {
    const before = await owned(BRUNO);
    const result = await attempt(
      "authenticated",
      ANA,
      `delete from public.${spec.table} where ${spec.owner}::text = $1`,
      [BRUNO],
    );
    if (spec.delete) {
      expect(result.ok).toBe(true);
      expect((result as { affected: number }).affected).toBe(0);
    } else {
      expect(result.ok).toBe(false);
      expect((result as { error: string }).error).toMatch(/permission denied/);
    }
    expect(await owned(BRUNO)).toBe(before);
  });

  if (!spec.insert) {
    it("user A cannot insert (only the server writes here)", async () => {
      const result = await attempt(
        "authenticated",
        ANA,
        `insert into public.${spec.table} default values`,
      );
      expect(result.ok).toBe(false);
      expect((result as { error: string }).error).toMatch(/permission denied/);
    });
  }
});

describe("SR-01: what an owner may still do (positive controls)", () => {
  it("A updates their own locale but not role, frozen or activated_at", async () => {
    const ok = await attempt(
      "authenticated",
      ANA,
      "update public.profiles set locale = 'en' where id = $1",
      [ANA],
    );
    expect(ok.ok && ok.affected).toBe(1);
    for (const column of ["role = 'admin'", "frozen = true", "activated_at = now()"]) {
      const result = await attempt(
        "authenticated",
        ANA,
        `update public.profiles set ${column} where id = $1`,
        [ANA],
      );
      expect(result.ok, column).toBe(false);
      expect((result as { error: string }).error).toMatch(/permission denied/);
    }
  });

  it("A creates, renames and deletes their own project, but cannot create one for B", async () => {
    const created = await attempt(
      "authenticated",
      ANA,
      "insert into public.projects (user_id, name) values ($1, 'Nova') returning id",
      [ANA],
    );
    expect(created.ok && created.rows.length).toBe(1);
    const renamed = await attempt(
      "authenticated",
      ANA,
      "update public.projects set name = 'Outra' where id = $1",
      [ANA_PROJECT_1],
    );
    expect(renamed.ok && renamed.affected).toBe(1);
    const deleted = await attempt(
      "authenticated",
      ANA,
      "delete from public.projects where id = $1",
      [ANA_PROJECT_2],
    );
    expect(deleted.ok && deleted.affected).toBe(1);

    const forged = await attempt(
      "authenticated",
      ANA,
      "insert into public.projects (user_id, name) values ($1, 'Falso')",
      [BRUNO],
    );
    expect(forged.ok).toBe(false);
    expect((forged as { error: string }).error).toMatch(/row-level security/);
    const takeover = await attempt(
      "authenticated",
      ANA,
      "update public.projects set user_id = $1 where id = $2",
      [BRUNO, ANA_PROJECT_1],
    );
    expect(takeover.ok).toBe(false);
    expect((takeover as { error: string }).error).toMatch(/permission denied/);
  });

  it("A cannot plant a map node in B's project or under B's node, whoever it claims to belong to", async () => {
    const insert = (project: string, owner: string, parent: string | null) =>
      attempt(
        "authenticated",
        ANA,
        `insert into public.map_nodes (project_id, user_id, parent_id, kind, title)
         values ($1, $2, $3, 'chapter', 'x')`,
        [project, owner, parent],
      );
    const own = await insert(ANA_PROJECT_1, ANA, null);
    expect(own.ok).toBe(true);
    const intoBruno = await insert(BRUNO_PROJECT, ANA, null);
    expect(intoBruno.ok).toBe(false);
    expect((intoBruno as { error: string }).error).toMatch(/foreign key/);
    const asBruno = await insert(BRUNO_PROJECT, BRUNO, null);
    expect(asBruno.ok).toBe(false);
    expect((asBruno as { error: string }).error).toMatch(/row-level security/);
    const underBruno = await insert(ANA_PROJECT_1, ANA, BRUNO_ARTICLE);
    expect(underBruno.ok).toBe(false);
    expect((underBruno as { error: string }).error).toMatch(/foreign key/);
  });

  it("map node identity columns (project, owner, kind) cannot be changed", async () => {
    for (const set of [
      "kind = 'chapter'",
      `project_id = '${ANA_PROJECT_2}'`,
      `user_id = '${BRUNO}'`,
    ]) {
      const result = await attempt(
        "authenticated",
        ANA,
        `update public.map_nodes set ${set} where id = $1`,
        [ANA_ARTICLE],
      );
      expect(result.ok, set).toBe(false);
      expect((result as { error: string }).error).toMatch(/permission denied/);
    }
    const ok = await attempt(
      "authenticated",
      ANA,
      "update public.map_nodes set title = 'Novo' where id = $1",
      [ANA_ARTICLE],
    );
    expect(ok.ok && ok.affected).toBe(1);
  });

  it("a group's quantities are not editable; its review state and article are, within the project", async () => {
    for (const set of [
      "area_m2 = 999",
      "length_m = 1",
      "element_count = 0",
      "style_key = 'x'",
      "user_id = '" + BRUNO + "'",
    ]) {
      const result = await attempt(
        "authenticated",
        ANA,
        `update public.sheet_groups set ${set} where id = $1`,
        [ANA_GROUP],
      );
      expect(result.ok, set).toBe(false);
      expect((result as { error: string }).error).toMatch(/permission denied/);
    }
    const state = await attempt(
      "authenticated",
      ANA,
      "update public.sheet_groups set review_state = 'rejected' where id = $1",
      [ANA_GROUP],
    );
    expect(state.ok && state.affected).toBe(1);
    const assign = await attempt(
      "authenticated",
      ANA,
      "update public.sheet_groups set article_id = $2 where id = $1",
      [ANA_GROUP, ANA_ARTICLE],
    );
    expect(assign.ok && assign.affected).toBe(1);
  });

  it("a group cannot be assigned to B's article, nor to an article of another of A's projects", async () => {
    for (const article of [BRUNO_ARTICLE, ANA_ARTICLE_OTHER_PROJECT]) {
      const result = await attempt(
        "authenticated",
        ANA,
        "update public.sheet_groups set article_id = $2 where id = $1",
        [ANA_GROUP, article],
      );
      expect(result.ok, article).toBe(false);
      expect((result as { error: string }).error).toMatch(/article_not_in_project/);
    }
  });
});

describe("SR-02: the ledger is closed to the API roles", () => {
  it.each(["authenticated", "anon"] as const)(
    "%s cannot write lots or reservations",
    async (role) => {
      const userId = role === "anon" ? null : ANA;
      const statements = [
        `insert into public.sheet_lots (user_id, origin, sheets_total, expires_at) values ('${ANA}', 'pass', 1000, now() + interval '90 days')`,
        "update public.sheet_lots set sheets_total = sheets_total + 100",
        "delete from public.sheet_lots",
        "delete from public.sheet_reservations",
        `insert into public.sheet_reservations (sheet_id, lot_id, user_id, state) values (gen_random_uuid(), gen_random_uuid(), '${ANA}', 'released')`,
      ];
      for (const sql of statements) {
        const result = await attempt(role, userId, sql);
        expect(result.ok, sql).toBe(false);
        expect((result as { error: string }).error, sql).toMatch(/permission denied/);
      }
    },
  );

  it.each([
    ["reserve_sheet", `'${ANA}', '${ANA_SHEET}'`],
    ["grant_lot", `'${ANA}', 'pass', 1000, now() + interval '90 days'`],
    ["revoke_lot", "gen_random_uuid()"],
    ["try_founder_price", `'${ANA}', 10`],
    ["rl_hit", "'k', 1, 60"],
    ["auth_attempt_reset", "'x'"],
  ])("authenticated cannot call %s", async (fn, args) => {
    const result = await attempt("authenticated", ANA, `select public.${fn}(${args})`);
    expect(result.ok).toBe(false);
    expect((result as { error: string }).error).toMatch(/permission denied/);
  });

  it("A reads the balance of their own lots through the view, never B's", async () => {
    const result = await attempt(
      "authenticated",
      ANA,
      "select user_id::text as owner, remaining from public.sheet_lot_balances",
    );
    expect(result.ok).toBe(true);
    const rows = (result as { rows: { owner: string; remaining: number }[] }).rows;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.owner === ANA)).toBe(true);
    const anon = await attempt("anon", null, "select * from public.sheet_lot_balances");
    expect(anon.ok).toBe(false);
  });
});

describe("SR-01: storage buckets", () => {
  const visible = async (role: ApiRole, userId: string | null) => {
    const result = await attempt(
      role,
      userId,
      "select bucket_id, name from storage.objects order by name",
    );
    return result.ok ? (result.rows as { bucket_id: string; name: string }[]) : [];
  };

  it("A sees only the files under their own folder, in both buckets", async () => {
    const rows = await visible("authenticated", ANA);
    expect(rows.map((r) => `${r.bucket_id}:${r.name.split("/")[0]}`).sort()).toEqual([
      `geometry:${ANA}`,
      `uploads:${ANA}`,
    ]);
  });

  it("B sees only B's files", async () => {
    const rows = await visible("authenticated", BRUNO);
    expect(rows.every((r) => r.name.startsWith(`${BRUNO}/`))).toBe(true);
    expect(rows).toHaveLength(2);
  });

  it("anon sees no file", async () => {
    expect(await visible("anon", null)).toEqual([]);
  });

  it("no API role can upload, replace or delete: only the server does", async () => {
    const before = await count("select count(*) as n from storage.objects");
    for (const [role, user] of [
      ["authenticated", ANA],
      ["anon", null],
    ] as const) {
      const insert = await attempt(
        role,
        user,
        `insert into storage.objects (bucket_id, name) values ('uploads', '${ANA}/x/y.pdf')`,
      );
      expect(insert.ok, `${role} insert`).toBe(false);
      const overwrite = await attempt(
        role,
        user,
        `update storage.objects set name = '${ANA}/z.pdf' where bucket_id = 'uploads'`,
      );
      expect(overwrite.ok ? overwrite.affected : 0, `${role} update`).toBe(0);
      const remove = await attempt(role, user, "delete from storage.objects");
      expect(remove.ok ? remove.affected : 0, `${role} delete`).toBe(0);
    }
    const forged = await attempt(
      "authenticated",
      ANA,
      `insert into storage.objects (bucket_id, name) values ('uploads', '${BRUNO}/x/y.pdf')`,
    );
    expect(forged.ok).toBe(false);
    expect(await count("select count(*) as n from storage.objects")).toBe(before);
  });
});

describe("SR-06: the login-attempt table never holds an email address", () => {
  it("is keyed by a hash and has no email column", async () => {
    const { rows } = await db.query<{ column_name: string }>(
      "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'auth_attempts'",
    );
    expect(rows.map((r) => r.column_name).sort()).toEqual([
      "email_hash",
      "failed",
      "locked_until",
      "updated_at",
    ]);
  });
});
