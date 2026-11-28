import { createSqlHarness } from "./harness";
import { defineStoreContract } from "./ledger.contract";

defineStoreContract("sql (supabase migration on PGlite)", () => createSqlHarness());
