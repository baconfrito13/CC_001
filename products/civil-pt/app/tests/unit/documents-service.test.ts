import { describe, expect, it } from "vitest";
import {
  type DocumentsWorld,
  documentsWorld,
  MINUTE,
  sheetSet,
} from "../support/documents-world";

const names = (w: DocumentsWorld) => w.events.events.map((event) => event.name);

async function project(
  w: DocumentsWorld,
  userId: string,
  name = "Rede de águas — Lote 3",
) {
  const result = await w.service.createProject({ userId, name });
  if (!result.ok) throw new Error("project not created");
  return result.project;
}

describe("projects (US-02)", () => {
  it("creates a project and counts it in project_created", async () => {
    const w = documentsWorld();
    const user = w.newUser();
    await project(w, user, "Primeiro");
    await project(w, user, "Segundo");
    expect(w.events.named("project_created").map((e) => e.props)).toEqual([
      { projects_total: 1 },
      { projects_total: 2 },
    ]);
  });

  it("limits project creation to 60 an hour", async () => {
    const w = documentsWorld({ projectsPerHour: 3 });
    const user = w.newUser();
    for (let i = 0; i < 3; i += 1) await project(w, user, `P${i}`);
    expect(await w.service.createProject({ userId: user, name: "P4" })).toMatchObject({
      ok: false,
      reason: "rate_limited",
    });
  });
});

describe("US-02.1/2: direct upload and sheets", () => {
  it("US-02.1: the signed URL points at private storage, expires within 10 min, and finalize creates the sheets with their scale", async () => {
    const w = documentsWorld();
    const user = w.newUser();
    const p = await project(w, user);
    const pdf = sheetSet(["ESC. 1/100", "ESCALA 1:50", null, "x"]);
    const { registered, path } = await w.upload(user, p.id, {
      fileName: "planta-4-folhas.pdf",
      bytes: pdf,
    });
    if (!registered.ok) throw new Error("not registered");

    const url = new URL(registered.uploadUrl, "http://x");
    expect(url.pathname.startsWith("/api/dev/storage/uploads/")).toBe(true);
    expect(url.searchParams.get("op")).toBe("upload");
    expect(
      Number(url.searchParams.get("exp")) * 1000 - w.now.getTime(),
    ).toBeLessThanOrEqual(10 * MINUTE);
    expect(registered.finalizeBy.getTime() - w.now.getTime()).toBe(10 * MINUTE);
    // the path is <user>/<project>/<document>.pdf, built from ids: no file name in it
    expect(path).toBe(`${user}/${p.id}/${registered.documentId}.pdf`);
    expect(path).not.toContain("planta");

    const done = await w.service.finalizeUpload({
      userId: user,
      documentId: registered.documentId,
    });
    if (!done.ok) throw new Error(`finalize failed: ${JSON.stringify(done)}`);
    expect(done.document).toMatchObject({
      status: "ready",
      pageCount: 4,
      fileName: "planta-4-folhas.pdf",
    });
    expect(
      done.document.sheets.map((s) => [s.pageNo, s.scaleRatio, s.scaleSource]),
    ).toEqual([
      [1, 100, "detected"],
      [2, 50, "detected"],
      [3, null, null],
      [4, null, null],
    ]);
    expect(w.events.named("sheet_uploaded")[0]?.props).toMatchObject({ pages: 4 });
    expect(await w.storage.get({ bucket: "uploads", path: path ?? "" })).not.toBeNull();
  });

  it("US-02.1: finalize twice gives the same sheets and counts one upload", async () => {
    const w = documentsWorld();
    const user = w.newUser();
    const p = await project(w, user);
    const { registered } = await w.upload(user, p.id, {
      fileName: "a.pdf",
      bytes: sheetSet([null, null]),
    });
    if (!registered.ok) throw new Error("not registered");
    const first = await w.service.finalizeUpload({
      userId: user,
      documentId: registered.documentId,
    });
    const second = await w.service.finalizeUpload({
      userId: user,
      documentId: registered.documentId,
    });
    if (!first.ok || !second.ok) throw new Error("finalize failed");
    expect(second.document.sheets.map((s) => s.id)).toEqual(
      first.document.sheets.map((s) => s.id),
    );
    expect(w.events.named("sheet_uploaded")).toHaveLength(1);
  });

  it("US-02.2: a file of 38 pages and many megabytes is accepted and shows 38 sheets", async () => {
    const w = documentsWorld();
    const user = w.newUser();
    const p = await project(w, user);
    const big = sheetSet(Array(38).fill("ESC. 1/200"), 30 * 1024 * 1024);
    const { registered } = await w.upload(user, p.id, {
      fileName: "projeto-completo.pdf",
      bytes: big,
    });
    if (!registered.ok) throw new Error("not registered");
    const done = await w.service.finalizeUpload({
      userId: user,
      documentId: registered.documentId,
    });
    if (!done.ok) throw new Error("finalize failed");
    expect(done.document.sheets).toHaveLength(38);
    expect(w.events.named("sheet_uploaded")[0]?.props.size_mb).toBeGreaterThanOrEqual(30);
  });

  it("US-02.1: the download URL lasts at most 10 minutes and exists only for a finished document", async () => {
    const w = documentsWorld();
    const user = w.newUser();
    const p = await project(w, user);
    const { registered } = await w.upload(user, p.id, {
      fileName: "a.pdf",
      bytes: sheetSet([null]),
    });
    if (!registered.ok) throw new Error("not registered");
    expect(
      await w.service.downloadUrl({ userId: user, documentId: registered.documentId }),
    ).toEqual({
      ok: false,
      reason: "not_found",
    });
    await w.service.finalizeUpload({ userId: user, documentId: registered.documentId });
    const result = await w.service.downloadUrl({
      userId: user,
      documentId: registered.documentId,
    });
    if (!result.ok) throw new Error("no url");
    expect(result.expiresAt.getTime() - w.now.getTime()).toBeLessThanOrEqual(10 * MINUTE);
    expect(new URL(result.url, "http://x").searchParams.get("op")).toBe("download");
  });
});

describe("US-02.3: what is refused, and that nothing stays", () => {
  it("a .dwg is refused before anything is stored, with reason 'type' and its extension", async () => {
    const w = documentsWorld();
    const user = w.newUser();
    const p = await project(w, user);
    const result = await w.service.registerUpload({
      userId: user,
      projectId: p.id,
      fileName: "desenho.DWG",
      sizeBytes: 5000,
    });
    expect(result).toEqual({ ok: false, reason: "rejected", rejection: "type" });
    expect(w.events.named("upload_rejected")[0]?.props).toEqual({
      reason: "type",
      extension: "dwg",
    });
    expect(
      await w.store.workspace.listDocuments({ userId: user, projectId: p.id }),
    ).toEqual([]);
    expect(w.storage.count("uploads")).toBe(0);
  });

  it("a PDF of 60 MB is refused with reason 'size'; exactly 50 MB is accepted", async () => {
    const w = documentsWorld();
    const user = w.newUser();
    const p = await project(w, user);
    expect(
      await w.service.registerUpload({
        userId: user,
        projectId: p.id,
        fileName: "grande.pdf",
        sizeBytes: 60 * 1024 * 1024,
      }),
    ).toEqual({ ok: false, reason: "rejected", rejection: "size" });
    expect(w.events.named("upload_rejected")[0]?.props).toEqual({
      reason: "size",
      extension: "pdf",
    });
    expect(
      (
        await w.service.registerUpload({
          userId: user,
          projectId: p.id,
          fileName: "limite.pdf",
          sizeBytes: 50 * 1024 * 1024,
        })
      ).ok,
    ).toBe(true);
  });

  it("a PDF of 45 pages is refused at finalize with reason 'pages'; the object and the row are removed", async () => {
    const w = documentsWorld();
    const user = w.newUser();
    const p = await project(w, user);
    const { registered, path } = await w.upload(user, p.id, {
      fileName: "45.pdf",
      bytes: sheetSet(Array(45).fill(null)),
    });
    if (!registered.ok) throw new Error("not registered");
    expect(
      await w.service.finalizeUpload({ userId: user, documentId: registered.documentId }),
    ).toEqual({
      ok: false,
      reason: "rejected",
      rejection: "pages",
    });
    expect(w.storage.has("uploads", path ?? "")).toBe(false);
    expect(
      await w.store.workspace.listDocuments({ userId: user, projectId: p.id }),
    ).toEqual([]);
    expect(w.events.named("upload_rejected")[0]?.props).toEqual({
      reason: "pages",
      extension: "pdf",
    });
    expect(w.events.named("sheet_uploaded")).toHaveLength(0);
  });

  it("the real object decides: a file that is not a PDF, or bigger than announced, is removed", async () => {
    const w = documentsWorld({ maxPdfBytes: 1024 * 1024 });
    const user = w.newUser();
    const p = await project(w, user);

    const text = await w.upload(user, p.id, {
      fileName: "falso.pdf",
      bytes: new TextEncoder().encode("MZ not a pdf"),
    });
    if (!text.registered.ok) throw new Error("not registered");
    expect(
      await w.service.finalizeUpload({
        userId: user,
        documentId: text.registered.documentId,
      }),
    ).toMatchObject({
      rejection: "type",
    });
    expect(w.storage.has("uploads", text.path ?? "")).toBe(false);

    // announces 100 bytes, sends 2 MB
    const registered = await w.service.registerUpload({
      userId: user,
      projectId: p.id,
      fileName: "mentira.pdf",
      sizeBytes: 100,
    });
    if (!registered.ok) throw new Error("not registered");
    const path = new URL(registered.uploadUrl, "http://x").pathname.replace(
      "/api/dev/storage/uploads/",
      "",
    );
    await w.storage.put({
      bucket: "uploads",
      path,
      body: sheetSet([null], 2 * 1024 * 1024),
      contentType: "application/pdf",
    });
    expect(
      await w.service.finalizeUpload({ userId: user, documentId: registered.documentId }),
    ).toMatchObject({
      rejection: "size",
    });
    expect(w.storage.count("uploads")).toBe(0);
    expect(
      await w.store.workspace.listDocuments({ userId: user, projectId: p.id }),
    ).toEqual([]);
  });

  it("limits uploads to 30 an hour per user", async () => {
    const w = documentsWorld({ uploadsPerHour: 3 });
    const user = w.newUser();
    const p = await project(w, user);
    for (let i = 0; i < 3; i += 1) {
      expect(
        (
          await w.service.registerUpload({
            userId: user,
            projectId: p.id,
            fileName: `f${i}.pdf`,
            sizeBytes: 10,
          })
        ).ok,
      ).toBe(true);
    }
    expect(
      await w.service.registerUpload({
        userId: user,
        projectId: p.id,
        fileName: "f4.pdf",
        sizeBytes: 10,
      }),
    ).toMatchObject({
      ok: false,
      reason: "rate_limited",
    });
  });
});

describe("US-02.4: an interrupted upload leaves nothing", () => {
  it("finalize without an object (the connection dropped before the first byte) removes the row", async () => {
    const w = documentsWorld();
    const user = w.newUser();
    const p = await project(w, user);
    const registered = await w.service.registerUpload({
      userId: user,
      projectId: p.id,
      fileName: "a.pdf",
      sizeBytes: 1000,
    });
    if (!registered.ok) throw new Error("not registered");
    expect(
      await w.service.finalizeUpload({ userId: user, documentId: registered.documentId }),
    ).toEqual({
      ok: false,
      reason: "rejected",
      rejection: "interrupted",
    });
    expect(
      await w.store.workspace.listDocuments({ userId: user, projectId: p.id }),
    ).toEqual([]);
  });

  it("abort removes the partial object and the row at once, and says 'interrupted'", async () => {
    const w = documentsWorld();
    const user = w.newUser();
    const p = await project(w, user);
    const { registered, path } = await w.upload(user, p.id, {
      fileName: "meio.pdf",
      bytes: sheetSet([null, null]).slice(0, 500),
    });
    if (!registered.ok) throw new Error("not registered");
    expect(
      await w.service.abortUpload({ userId: user, documentId: registered.documentId }),
    ).toEqual({ ok: true });
    expect(w.storage.has("uploads", path ?? "")).toBe(false);
    expect(
      await w.store.workspace.getDocument({
        userId: user,
        documentId: registered.documentId,
      }),
    ).toBeNull();
    expect(w.events.named("upload_rejected")[0]?.props).toEqual({
      reason: "interrupted",
      extension: "pdf",
    });
    // repeating it is harmless and counts nothing more
    expect(
      await w.service.abortUpload({ userId: user, documentId: registered.documentId }),
    ).toEqual({ ok: true });
    expect(w.events.named("upload_rejected")).toHaveLength(1);
  });

  it("abort never removes a finished document, and cannot touch somebody else's", async () => {
    const w = documentsWorld();
    const owner = w.newUser();
    const other = w.newUser();
    const p = await project(w, owner);
    const { registered, path } = await w.upload(owner, p.id, {
      fileName: "a.pdf",
      bytes: sheetSet([null]),
    });
    if (!registered.ok) throw new Error("not registered");
    await w.service.abortUpload({ userId: other, documentId: registered.documentId });
    expect(w.storage.has("uploads", path ?? "")).toBe(true);
    await w.service.finalizeUpload({ userId: owner, documentId: registered.documentId });
    await w.service.abortUpload({ userId: owner, documentId: registered.documentId });
    expect(w.storage.has("uploads", path ?? "")).toBe(true);
    expect(
      (
        await w.store.workspace.getDocument({
          userId: owner,
          documentId: registered.documentId,
        })
      )?.status,
    ).toBe("ready");
  });

  it("SR-11: a document finalized after 10 minutes is refused and its object removed, even if it is a valid PDF", async () => {
    const w = documentsWorld();
    const user = w.newUser();
    const p = await project(w, user);
    const { registered, path } = await w.upload(user, p.id, {
      fileName: "lento.pdf",
      bytes: sheetSet([null]),
    });
    if (!registered.ok) throw new Error("not registered");
    w.advance(10 * MINUTE - 1000);
    // just inside the window it would still work: prove it on a second upload
    const second = await w.upload(user, p.id, {
      fileName: "a-tempo.pdf",
      bytes: sheetSet([null]),
    });
    if (!second.registered.ok) throw new Error("not registered");
    expect(
      (
        await w.service.finalizeUpload({
          userId: user,
          documentId: second.registered.documentId,
        })
      ).ok,
    ).toBe(true);
    w.advance(2000);
    expect(
      await w.service.finalizeUpload({ userId: user, documentId: registered.documentId }),
    ).toMatchObject({
      ok: false,
      rejection: "interrupted",
    });
    expect(w.storage.has("uploads", path ?? "")).toBe(false);
  });

  it("US-02.4: coming back to the project after 10 minutes removes the dead upload (object and row) and counts it", async () => {
    const w = documentsWorld();
    const user = w.newUser();
    const p = await project(w, user);
    const dead = await w.upload(user, p.id, {
      fileName: "meio.pdf",
      bytes: sheetSet([null]).slice(0, 300),
    });
    if (!dead.registered.ok) throw new Error("not registered");
    w.advance(5 * MINUTE);
    const alive = await w.upload(user, p.id, {
      fileName: "agora.pdf",
      bytes: sheetSet([null]),
    });
    if (!alive.registered.ok) throw new Error("not registered");

    // 9 minutes after the first: still inside the window, nothing is removed
    w.advance(4 * MINUTE);
    expect(await w.service.reapInterrupted({ userId: user, projectId: p.id })).toBe(0);
    expect(w.storage.count("uploads")).toBe(2);
    // 11 minutes after the first, 6 after the second
    w.advance(2 * MINUTE);
    expect(await w.service.reapInterrupted({ userId: user, projectId: p.id })).toBe(1);
    expect(w.storage.has("uploads", dead.path ?? "")).toBe(false);
    expect(w.storage.has("uploads", alive.path ?? "")).toBe(true);
    expect(w.events.named("upload_rejected")).toHaveLength(1);
    // only that project of that user is looked at
    expect(
      await w.service.reapInterrupted({ userId: w.newUser(), projectId: p.id }),
    ).toBe(0);
  });

  it("US-02.4: the maintenance run removes every dead upload of every account within 10 minutes", async () => {
    const w = documentsWorld();
    const a = w.newUser();
    const b = w.newUser();
    const pa = await project(w, a);
    const pb = await project(w, b);
    const one = await w.upload(a, pa.id, {
      fileName: "a.pdf",
      bytes: sheetSet([null]).slice(0, 100),
    });
    const two = await w.upload(b, pb.id, {
      fileName: "b.pdf",
      bytes: sheetSet([null]).slice(0, 100),
    });
    const done = await w.upload(b, pb.id, { fileName: "c.pdf", bytes: sheetSet([null]) });
    if (!one.registered.ok || !two.registered.ok || !done.registered.ok)
      throw new Error("not registered");
    await w.service.finalizeUpload({ userId: b, documentId: done.registered.documentId });

    w.advance(9 * MINUTE);
    expect(await w.service.reapAllStale({ limit: 100 })).toBe(0);
    w.advance(2 * MINUTE);
    expect(await w.service.reapAllStale({ limit: 100 })).toBe(2);
    expect(w.storage.count("uploads")).toBe(1); // the finished document's file stays
    expect(await w.service.reapAllStale({ limit: 100 })).toBe(0);
    expect(names(w).filter((n) => n === "upload_rejected")).toHaveLength(2);
  });
});

describe("US-02.5: deleting a project", () => {
  it("removes the rows and every file of that project, and nothing of the others", async () => {
    const w = documentsWorld();
    const user = w.newUser();
    const doomed = await project(w, user, "Para apagar");
    const kept = await project(w, user, "Para ficar");
    for (const target of [doomed, kept]) {
      const { registered } = await w.upload(user, target.id, {
        fileName: "a.pdf",
        bytes: sheetSet([null, null, null, null]),
      });
      if (!registered.ok) throw new Error("not registered");
      await w.service.finalizeUpload({ userId: user, documentId: registered.documentId });
    }
    expect(w.storage.count("uploads")).toBe(2);

    expect(await w.service.deleteProject({ userId: user, projectId: doomed.id })).toEqual(
      { ok: true },
    );
    expect(w.storage.count("uploads")).toBe(1);
    expect(
      await w.store.workspace.getProject({ userId: user, projectId: doomed.id }),
    ).toBeNull();
    expect(
      await w.store.workspace.listDocuments({ userId: user, projectId: doomed.id }),
    ).toEqual([]);
    expect(
      await w.store.workspace.listDocuments({ userId: user, projectId: kept.id }),
    ).toHaveLength(1);
    expect(w.events.named("project_deleted")).toHaveLength(1);
    // the second time there is nothing
    expect(await w.service.deleteProject({ userId: user, projectId: doomed.id })).toEqual(
      { ok: false, reason: "not_found" },
    );
  });

  it("if the files cannot be removed the project stays, so nothing is orphaned silently", async () => {
    const w = documentsWorld();
    const user = w.newUser();
    const p = await project(w, user);
    const original = w.storage.removePrefix.bind(w.storage);
    w.storage.removePrefix = async () => {
      throw new Error("storage unavailable");
    };
    await expect(
      w.service.deleteProject({ userId: user, projectId: p.id }),
    ).rejects.toThrow("storage unavailable");
    expect(
      await w.store.workspace.getProject({ userId: user, projectId: p.id }),
    ).not.toBeNull();
    expect(w.events.named("project_deleted")).toHaveLength(0);
    w.storage.removePrefix = original;
    expect(await w.service.deleteProject({ userId: user, projectId: p.id })).toEqual({
      ok: true,
    });
  });
});

describe("US-02.6: user B cannot reach user A's project", () => {
  it("every operation answers 'not found' and changes nothing", async () => {
    const w = documentsWorld();
    const a = w.newUser();
    const b = w.newUser();
    const p = await project(w, a);
    const { registered, path } = await w.upload(a, p.id, {
      fileName: "a.pdf",
      bytes: sheetSet([null]),
    });
    if (!registered.ok) throw new Error("not registered");
    const done = await w.service.finalizeUpload({
      userId: a,
      documentId: registered.documentId,
    });
    if (!done.ok) throw new Error("not finalized");
    const sheetId = done.document.sheets[0]?.id ?? "";

    expect(
      await w.service.registerUpload({
        userId: b,
        projectId: p.id,
        fileName: "x.pdf",
        sizeBytes: 10,
      }),
    ).toEqual({ ok: false, reason: "not_found" });
    expect(
      await w.service.finalizeUpload({ userId: b, documentId: registered.documentId }),
    ).toEqual({ ok: false, reason: "not_found" });
    expect(
      await w.service.downloadUrl({ userId: b, documentId: registered.documentId }),
    ).toEqual({ ok: false, reason: "not_found" });
    expect(await w.service.deleteProject({ userId: b, projectId: p.id })).toEqual({
      ok: false,
      reason: "not_found",
    });
    expect(await w.service.setScale({ userId: b, sheetId, ratio: 500 })).toEqual({
      ok: false,
      reason: "not_found",
    });
    expect(await w.store.workspace.listProjects({ userId: b })).toEqual([]);
    expect(w.storage.has("uploads", path ?? "")).toBe(true);
    expect(
      await w.store.workspace.getProject({ userId: a, projectId: p.id }),
    ).not.toBeNull();
  });
});

describe("US-03: setting the scale", () => {
  it("US-03.3: choosing another value is manual, is recorded, and a confirmed detection stays 'detected'", async () => {
    const w = documentsWorld();
    const user = w.newUser();
    const p = await project(w, user);
    const { registered } = await w.upload(user, p.id, {
      fileName: "a.pdf",
      bytes: sheetSet(["ESC. 1/100", null]),
    });
    if (!registered.ok) throw new Error("not registered");
    const done = await w.service.finalizeUpload({
      userId: user,
      documentId: registered.documentId,
    });
    if (!done.ok) throw new Error("not finalized");
    const [detected, plain] = done.document.sheets;

    expect(
      await w.service.setScale({ userId: user, sheetId: detected?.id ?? "", ratio: 100 }),
    ).toMatchObject({
      ok: true,
      sheet: { scaleRatio: 100, scaleSource: "detected" },
    });
    expect(
      await w.service.setScale({ userId: user, sheetId: detected?.id ?? "", ratio: 200 }),
    ).toMatchObject({
      ok: true,
      sheet: { scaleRatio: 200, scaleSource: "manual" },
    });
    expect(
      await w.service.setScale({ userId: user, sheetId: plain?.id ?? "", ratio: 50 }),
    ).toMatchObject({
      ok: true,
      sheet: { scaleRatio: 50, scaleSource: "manual" },
    });
    expect(w.events.named("scale_set").map((e) => e.props)).toEqual([
      { source: "detected", ratio: 100 },
      { source: "manual", ratio: 200 },
      { source: "manual", ratio: 50 },
    ]);
  });
});
