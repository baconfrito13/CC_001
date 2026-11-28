import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { NewSheet } from "@/lib/data/types";
import type { Harness } from "./harness";

const T0 = new Date("2026-03-01T10:00:00.000Z");
const minutes = (n: number, from: Date = T0) => new Date(from.getTime() + n * 60_000);

const page = (pageNo: number, overrides: Partial<NewSheet> = {}): NewSheet => ({
  pageNo,
  widthPt: 1683.78,
  heightPt: 1190.55,
  scaleRatio: null,
  scaleSource: null,
  ...overrides,
});

/**
 * The workspace contract: projects, documents and sheets (US-02, US-03). The same scenarios
 * run against the memory store and against the SQL functions of the migration.
 */
export function defineWorkspaceContract(label: string, create: () => Promise<Harness>) {
  describe(`workspace contract: ${label}`, () => {
    let h: Harness;
    beforeAll(async () => {
      h = await create();
    });
    afterAll(async () => {
      await h.close();
    });

    const ws = () => h.store.workspace;

    /** A project with one registered (still pending) document. */
    const pendingDocument = async (userId: string, now = T0, fileName = "planta.pdf") => {
      const project = await ws().createProject({ userId, name: "Rede de águas", now });
      const documentId = randomUUID();
      const registered = await ws().registerDocument({
        userId,
        projectId: project.id,
        documentId,
        storagePath: `${userId}/${project.id}/${documentId}.pdf`,
        fileName,
        sizeBytes: 18_000_000,
        now,
      });
      if (!registered.ok) throw new Error("document not registered");
      return { project, documentId, document: registered.document };
    };

    const readyDocument = async (userId: string, pages: NewSheet[]) => {
      const pending = await pendingDocument(userId);
      const done = await ws().finalizeDocument({
        userId,
        documentId: pending.documentId,
        pageCount: pages.length,
        sheets: pages,
        now: minutes(1),
      });
      if (!done.ok) throw new Error("finalize failed");
      return { ...pending, document: done.document };
    };

    describe("projects", () => {
      it("US-02: creates projects and lists the newest first with their counts", async () => {
        const user = await h.newUser();
        const first = await ws().createProject({
          userId: user,
          name: "Primeiro",
          now: T0,
        });
        const second = await ws().createProject({
          userId: user,
          name: "Segundo",
          now: minutes(5),
        });
        const list = await ws().listProjects({ userId: user });
        expect(list.map((p) => p.name)).toEqual(["Segundo", "Primeiro"]);
        expect(list.map((p) => p.id)).toEqual([second.id, first.id]);
        expect(list[0]).toMatchObject({ documentCount: 0, sheetCount: 0 });
        expect(second.createdAt.getTime()).toBe(minutes(5).getTime());
      });

      it("US-02: the counts include finished documents only", async () => {
        const user = await h.newUser();
        const done = await readyDocument(user, [page(1), page(2), page(3)]);
        await ws().registerDocument({
          userId: user,
          projectId: done.project.id,
          documentId: randomUUID(),
          storagePath: `${user}/${done.project.id}/${randomUUID()}.pdf`,
          fileName: "outra.pdf",
          sizeBytes: 10,
          now: minutes(2),
        });
        const [summary] = await ws().listProjects({ userId: user });
        expect(summary).toMatchObject({ documentCount: 1, sheetCount: 3 });
      });

      it("US-02.6: another user gets nothing: not the project, not the list, not a delete", async () => {
        const owner = await h.newUser();
        const other = await h.newUser();
        const project = await ws().createProject({
          userId: owner,
          name: "Privado",
          now: T0,
        });
        expect(
          await ws().getProject({ userId: other, projectId: project.id }),
        ).toBeNull();
        expect(await ws().listProjects({ userId: other })).toEqual([]);
        expect(await ws().deleteProject({ userId: other, projectId: project.id })).toBe(
          false,
        );
        expect(
          await ws().getProject({ userId: owner, projectId: project.id }),
        ).toMatchObject({ name: "Privado" });
      });

      it("US-02.6: a document cannot be registered in somebody else's project", async () => {
        const owner = await h.newUser();
        const other = await h.newUser();
        const project = await ws().createProject({
          userId: owner,
          name: "Privado",
          now: T0,
        });
        const result = await ws().registerDocument({
          userId: other,
          projectId: project.id,
          documentId: randomUUID(),
          storagePath: "x/y/z.pdf",
          fileName: "intruso.pdf",
          sizeBytes: 1,
          now: T0,
        });
        expect(result).toEqual({ ok: false, reason: "not_found" });
      });

      it("US-02.5: deleting a project removes its documents and sheets", async () => {
        const user = await h.newUser();
        const done = await readyDocument(user, [page(1), page(2)]);
        const sheetId = done.document.sheets[0]?.id ?? "";
        expect(
          await ws().deleteProject({ userId: user, projectId: done.project.id }),
        ).toBe(true);
        expect(
          await ws().getProject({ userId: user, projectId: done.project.id }),
        ).toBeNull();
        expect(
          await ws().getDocument({ userId: user, documentId: done.documentId }),
        ).toBeNull();
        expect(await ws().getSheet({ userId: user, sheetId })).toBeNull();
        expect(
          await ws().deleteProject({ userId: user, projectId: done.project.id }),
        ).toBe(false);
      });
    });

    describe("documents and sheets", () => {
      it("US-02: a registered document is pending and has no sheets", async () => {
        const user = await h.newUser();
        const { document } = await pendingDocument(user);
        expect(document).toMatchObject({
          status: "pending_upload",
          pageCount: null,
          fileName: "planta.pdf",
          sheets: [],
        });
      });

      it("US-02.1: finalize creates one sheet per page, in page order, and marks the document ready", async () => {
        const user = await h.newUser();
        const done = await readyDocument(user, [
          page(2, { scaleRatio: 50, scaleSource: "detected" }),
          page(1),
          page(3),
          page(4),
        ]);
        expect(done.document).toMatchObject({ status: "ready", pageCount: 4 });
        expect(done.document.sheets.map((s) => s.pageNo)).toEqual([1, 2, 3, 4]);
        expect(done.document.sheets[1]).toMatchObject({
          scaleRatio: 50,
          scaleSource: "detected",
          status: "uploaded",
          needsRecalc: false,
          widthPt: 1683.78,
        });
        expect(done.document.sheets[0]).toMatchObject({
          scaleRatio: null,
          scaleSource: null,
        });
        const listed = await ws().listDocuments({
          userId: user,
          projectId: done.project.id,
        });
        expect(listed).toHaveLength(1);
        expect(listed[0]?.sheets).toHaveLength(4);
      });

      it("US-02.1: finalize is idempotent and does not duplicate the sheets", async () => {
        const user = await h.newUser();
        const done = await readyDocument(user, [page(1), page(2)]);
        const again = await ws().finalizeDocument({
          userId: user,
          documentId: done.documentId,
          pageCount: 2,
          sheets: [page(1), page(2)],
          now: minutes(3),
        });
        expect(again).toMatchObject({ ok: true, already: true });
        if (!again.ok) throw new Error("unreachable");
        expect(again.document.sheets.map((s) => s.id)).toEqual(
          done.document.sheets.map((s) => s.id),
        );
      });

      it("US-02.6: another user cannot finalize, read or abandon the document", async () => {
        const owner = await h.newUser();
        const other = await h.newUser();
        const { documentId } = await pendingDocument(owner);
        expect(
          await ws().finalizeDocument({
            userId: other,
            documentId,
            pageCount: 1,
            sheets: [page(1)],
            now: T0,
          }),
        ).toEqual({ ok: false, reason: "not_found" });
        expect(await ws().getDocument({ userId: other, documentId })).toBeNull();
        expect(await ws().abandonDocument({ userId: other, documentId })).toEqual({
          ok: false,
          reason: "not_found",
        });
        expect(await ws().getDocument({ userId: owner, documentId })).not.toBeNull();
      });

      it("US-02.3/4: abandoning a pending document removes it and names its object; a ready one stays", async () => {
        const user = await h.newUser();
        const pending = await pendingDocument(user);
        const abandoned = await ws().abandonDocument({
          userId: user,
          documentId: pending.documentId,
        });
        expect(abandoned).toEqual({
          ok: true,
          storagePath: pending.document.storagePath,
        });
        expect(
          await ws().getDocument({ userId: user, documentId: pending.documentId }),
        ).toBeNull();

        const done = await readyDocument(user, [page(1)]);
        expect(
          await ws().abandonDocument({ userId: user, documentId: done.documentId }),
        ).toEqual({
          ok: false,
          reason: "not_pending",
        });
        expect(
          await ws().getDocument({ userId: user, documentId: done.documentId }),
        ).not.toBeNull();
      });

      it("US-02.4: lists the pending uploads registered before a moment, oldest first", async () => {
        const user = await h.newUser();
        const old = await pendingDocument(user, new Date("2026-01-01T00:00:00Z"));
        const recent = await pendingDocument(user, new Date("2026-01-01T00:20:00Z"));
        const cutoff = new Date("2026-01-01T00:10:00Z");
        const stale = await ws().listStalePendingDocuments({
          before: cutoff,
          limit: 1000,
        });
        const ids = stale.map((d) => d.id);
        expect(ids).toContain(old.documentId);
        expect(ids).not.toContain(recent.documentId);
        const entry = stale.find((d) => d.id === old.documentId);
        expect(entry).toEqual({
          id: old.documentId,
          userId: user,
          storagePath: old.document.storagePath,
        });
        const limited = await ws().listStalePendingDocuments({
          before: cutoff,
          limit: 0,
        });
        expect(limited).toEqual([]);
      });

      it("US-02.4: a finished document is never listed as stale", async () => {
        const user = await h.newUser();
        const done = await readyDocument(user, [page(1)]);
        const stale = await ws().listStalePendingDocuments({
          before: new Date("2099-01-01T00:00:00Z"),
          limit: 10_000,
        });
        expect(stale.map((d) => d.id)).not.toContain(done.documentId);
      });
    });

    describe("scale (US-03)", () => {
      const sheetOf = async (userId: string, scale: Partial<NewSheet> = {}) => {
        const done = await readyDocument(userId, [page(1, scale)]);
        const sheet = done.document.sheets[0];
        if (!sheet) throw new Error("no sheet");
        return sheet;
      };

      it("US-03.1: confirming the detected value keeps the source 'detected'", async () => {
        const user = await h.newUser();
        const sheet = await sheetOf(user, { scaleRatio: 100, scaleSource: "detected" });
        const result = await ws().setSheetScale({
          userId: user,
          sheetId: sheet.id,
          ratio: 100,
          now: T0,
        });
        expect(result).toMatchObject({
          ok: true,
          previousRatio: 100,
          previousSource: "detected",
        });
        if (!result.ok) throw new Error("unreachable");
        expect(result.sheet).toMatchObject({
          scaleRatio: 100,
          scaleSource: "detected",
          needsRecalc: false,
        });
      });

      it("US-03.3: a different value is manual and prevails", async () => {
        const user = await h.newUser();
        const sheet = await sheetOf(user, { scaleRatio: 100, scaleSource: "detected" });
        const result = await ws().setSheetScale({
          userId: user,
          sheetId: sheet.id,
          ratio: 200,
          now: T0,
        });
        if (!result.ok) throw new Error("unreachable");
        expect(result.sheet).toMatchObject({ scaleRatio: 200, scaleSource: "manual" });
        expect(
          (await ws().getSheet({ userId: user, sheetId: sheet.id }))?.scaleRatio,
        ).toBe(200);
      });

      it("US-03.2: a sheet with no scale takes a manual one", async () => {
        const user = await h.newUser();
        const sheet = await sheetOf(user);
        const result = await ws().setSheetScale({
          userId: user,
          sheetId: sheet.id,
          ratio: 50,
          now: T0,
        });
        expect(result).toMatchObject({
          ok: true,
          previousRatio: null,
          previousSource: null,
        });
        if (!result.ok) throw new Error("unreachable");
        expect(result.sheet).toMatchObject({ scaleRatio: 50, scaleSource: "manual" });
      });

      it("US-03.3: quantities already computed are flagged 'a recalcular' when the value changes, not when it is repeated", async () => {
        const user = await h.newUser();
        const sheet = await sheetOf(user, { scaleRatio: 100, scaleSource: "detected" });
        await h.setSheetStatus(sheet.id, "ready");

        const same = await ws().setSheetScale({
          userId: user,
          sheetId: sheet.id,
          ratio: 100,
          now: T0,
        });
        if (!same.ok) throw new Error("unreachable");
        expect(same.sheet.needsRecalc).toBe(false);

        const changed = await ws().setSheetScale({
          userId: user,
          sheetId: sheet.id,
          ratio: 200,
          now: T0,
        });
        if (!changed.ok) throw new Error("unreachable");
        expect(changed.sheet.needsRecalc).toBe(true);

        // Going back does not clear the flag: the stored quantities still belong to 1:100.
        const back = await ws().setSheetScale({
          userId: user,
          sheetId: sheet.id,
          ratio: 100,
          now: T0,
        });
        if (!back.ok) throw new Error("unreachable");
        expect(back.sheet.needsRecalc).toBe(true);
      });

      it("US-03.3: a sheet without quantities is not flagged", async () => {
        const user = await h.newUser();
        const sheet = await sheetOf(user, { scaleRatio: 100, scaleSource: "detected" });
        const result = await ws().setSheetScale({
          userId: user,
          sheetId: sheet.id,
          ratio: 200,
          now: T0,
        });
        if (!result.ok) throw new Error("unreachable");
        expect(result.sheet.needsRecalc).toBe(false);
      });

      it("US-02.6: another user cannot read or change the scale of a sheet", async () => {
        const owner = await h.newUser();
        const other = await h.newUser();
        const sheet = await sheetOf(owner, { scaleRatio: 100, scaleSource: "detected" });
        expect(await ws().getSheet({ userId: other, sheetId: sheet.id })).toBeNull();
        expect(
          await ws().setSheetScale({
            userId: other,
            sheetId: sheet.id,
            ratio: 500,
            now: T0,
          }),
        ).toEqual({ ok: false, reason: "not_found" });
        expect(
          (await ws().getSheet({ userId: owner, sheetId: sheet.id }))?.scaleRatio,
        ).toBe(100);
      });

      it("US-03: refuses a scale outside 1:1 to 1:10000", async () => {
        const user = await h.newUser();
        const sheet = await sheetOf(user);
        for (const ratio of [0, 10_001, -5]) {
          await expect(
            ws().setSheetScale({ userId: user, sheetId: sheet.id, ratio, now: T0 }),
          ).rejects.toThrow();
        }
        expect(
          (await ws().getSheet({ userId: user, sheetId: sheet.id }))?.scaleRatio,
        ).toBeNull();
      });
    });

    describe("accounts", () => {
      it("US-01: knows whether an email has an account (case and spaces ignored)", async () => {
        const email = `Ana.${randomUUID()}@Empresa-Exemplo.pt`;
        await h.newUser({ email });
        expect(await ws().userExists(email.toLowerCase())).toBe(true);
        expect(await ws().userExists(`  ${email.toUpperCase()} `)).toBe(true);
        expect(await ws().userExists(`nobody.${randomUUID()}@empresa-exemplo.pt`)).toBe(
          false,
        );
      });
    });
  });
}
