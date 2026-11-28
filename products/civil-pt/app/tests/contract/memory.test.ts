import { createMemoryHarness } from "./harness";
import { defineStoreContract } from "./ledger.contract";

defineStoreContract("memory", async () => createMemoryHarness());
