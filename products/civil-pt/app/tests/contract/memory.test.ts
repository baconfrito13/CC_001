import { createMemoryHarness } from "./harness";
import { defineStoreContract } from "./ledger.contract";
import { defineWorkspaceContract } from "./workspace.contract";

defineStoreContract("memory", async () => createMemoryHarness());
defineWorkspaceContract("memory", async () => createMemoryHarness());
