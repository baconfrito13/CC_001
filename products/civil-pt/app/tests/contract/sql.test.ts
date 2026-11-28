import { createSqlHarness } from "./harness";
import { defineStoreContract } from "./ledger.contract";
import { defineWorkspaceContract } from "./workspace.contract";

defineStoreContract("sql (supabase migration on PGlite)", () => createSqlHarness());
defineWorkspaceContract("sql (supabase migration on PGlite)", () => createSqlHarness());
