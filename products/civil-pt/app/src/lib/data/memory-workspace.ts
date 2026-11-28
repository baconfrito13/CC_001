import { randomUUID } from "node:crypto";
import type {
  AbandonDocumentResult,
  DocumentRecord,
  FinalizeDocumentResult,
  NewSheet,
  ProjectRecord,
  ProjectSummary,
  RegisterDocumentResult,
  ScaleSource,
  SetScaleResult,
  SheetRecord,
  StalePendingDocument,
  Workspace,
} from "./types";

/**
 * In-memory projects, documents and sheets, mirroring the SQL functions of
 * supabase/migrations/20261129100000_projects_documents.sql rule for rule (the contract suite
 * in tests/contract proves it). Every method runs to completion without awaiting, so each
 * operation is atomic like its SQL counterpart.
 */

interface ProjectRow {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
}

interface DocumentRow {
  id: string;
  projectId: string;
  userId: string;
  storagePath: string;
  fileName: string;
  sizeBytes: number;
  pageCount: number | null;
  status: DocumentRecord["status"];
  createdAt: Date;
}

interface SheetRow extends SheetRecord {
  userId: string;
  createdAt: Date;
}

/** Accounts of the mock sign-in (and the owners of the demo data). */
export interface MemoryUser {
  id: string;
  email: string;
  locale: "en" | "pt";
  role: "user" | "admin";
}

export class MemoryUserDirectory {
  private readonly byId = new Map<string, MemoryUser>();
  private readonly byEmail = new Map<string, MemoryUser>();

  private static key(email: string) {
    return email.trim().toLowerCase();
  }

  add(user: MemoryUser): void {
    this.byId.set(user.id, user);
    this.byEmail.set(MemoryUserDirectory.key(user.email), user);
  }

  findByEmail(email: string): MemoryUser | undefined {
    return this.byEmail.get(MemoryUserDirectory.key(email));
  }

  findById(id: string): MemoryUser | undefined {
    return this.byId.get(id);
  }
}

export class MemoryWorkspace implements Workspace {
  private readonly projects = new Map<string, ProjectRow>();
  private readonly documents = new Map<string, DocumentRow>();
  private readonly sheets = new Map<string, SheetRow>();

  constructor(private readonly directory: MemoryUserDirectory) {}

  /** Who owns this sheet? The ledger reserves only the owner's own sheets. */
  sheetOwner(sheetId: string): string | undefined {
    return this.sheets.get(sheetId)?.userId;
  }

  private toSheet(row: SheetRow): SheetRecord {
    const { userId: _userId, createdAt: _createdAt, ...sheet } = row;
    return { ...sheet };
  }

  private toDocument(row: DocumentRow): DocumentRecord {
    return {
      id: row.id,
      projectId: row.projectId,
      fileName: row.fileName,
      sizeBytes: row.sizeBytes,
      pageCount: row.pageCount,
      status: row.status,
      storagePath: row.storagePath,
      createdAt: row.createdAt,
      sheets: [...this.sheets.values()]
        .filter((sheet) => sheet.documentId === row.id)
        .sort((a, b) => a.pageNo - b.pageNo)
        .map((sheet) => this.toSheet(sheet)),
    };
  }

  private ownedProject(userId: string, projectId: string): ProjectRow | undefined {
    const row = this.projects.get(projectId);
    return row?.userId === userId ? row : undefined;
  }

  private ownedDocument(userId: string, documentId: string): DocumentRow | undefined {
    const row = this.documents.get(documentId);
    return row?.userId === userId ? row : undefined;
  }

  async createProject(input: {
    userId: string;
    name: string;
    now: Date;
  }): Promise<ProjectRecord> {
    if (input.name.length < 1 || input.name.length > 120) {
      throw new RangeError("invalid_project_name");
    }
    const row: ProjectRow = {
      id: randomUUID(),
      userId: input.userId,
      name: input.name,
      createdAt: input.now,
    };
    this.projects.set(row.id, row);
    return { id: row.id, name: row.name, createdAt: row.createdAt };
  }

  async listProjects(input: { userId: string }): Promise<ProjectSummary[]> {
    return [...this.projects.values()]
      .filter((project) => project.userId === input.userId)
      .sort(
        (a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime() || a.id.localeCompare(b.id),
      )
      .map((project) => ({
        id: project.id,
        name: project.name,
        createdAt: project.createdAt,
        documentCount: [...this.documents.values()].filter(
          (doc) => doc.projectId === project.id && doc.status === "ready",
        ).length,
        sheetCount: [...this.sheets.values()].filter(
          (sheet) => sheet.projectId === project.id,
        ).length,
      }));
  }

  async getProject(input: {
    userId: string;
    projectId: string;
  }): Promise<ProjectRecord | null> {
    const row = this.ownedProject(input.userId, input.projectId);
    return row ? { id: row.id, name: row.name, createdAt: row.createdAt } : null;
  }

  async deleteProject(input: { userId: string; projectId: string }): Promise<boolean> {
    if (!this.ownedProject(input.userId, input.projectId)) return false;
    this.projects.delete(input.projectId);
    for (const doc of [...this.documents.values()]) {
      if (doc.projectId === input.projectId) this.documents.delete(doc.id);
    }
    for (const sheet of [...this.sheets.values()]) {
      if (sheet.projectId === input.projectId) this.sheets.delete(sheet.id);
    }
    return true;
  }

  async registerDocument(input: {
    userId: string;
    projectId: string;
    documentId: string;
    storagePath: string;
    fileName: string;
    sizeBytes: number;
    now: Date;
  }): Promise<RegisterDocumentResult> {
    if (!this.ownedProject(input.userId, input.projectId)) {
      return { ok: false, reason: "not_found" };
    }
    if (
      input.fileName.length < 1 ||
      input.fileName.length > 255 ||
      input.sizeBytes <= 0
    ) {
      throw new RangeError("invalid_document");
    }
    if (this.documents.has(input.documentId)) throw new Error("duplicate_document");
    const row: DocumentRow = {
      id: input.documentId,
      projectId: input.projectId,
      userId: input.userId,
      storagePath: input.storagePath,
      fileName: input.fileName,
      sizeBytes: input.sizeBytes,
      pageCount: null,
      status: "pending_upload",
      createdAt: input.now,
    };
    this.documents.set(row.id, row);
    return { ok: true, document: this.toDocument(row) };
  }

  async getDocument(input: {
    userId: string;
    documentId: string;
  }): Promise<DocumentRecord | null> {
    const row = this.ownedDocument(input.userId, input.documentId);
    return row ? this.toDocument(row) : null;
  }

  async listDocuments(input: {
    userId: string;
    projectId: string;
  }): Promise<DocumentRecord[]> {
    return [...this.documents.values()]
      .filter((doc) => doc.projectId === input.projectId && doc.userId === input.userId)
      .sort(
        (a, b) =>
          a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id),
      )
      .map((doc) => this.toDocument(doc));
  }

  async finalizeDocument(input: {
    userId: string;
    documentId: string;
    pageCount: number;
    sheets: NewSheet[];
    now: Date;
  }): Promise<FinalizeDocumentResult> {
    const doc = this.ownedDocument(input.userId, input.documentId);
    if (!doc) return { ok: false, reason: "not_found" };
    if (doc.status === "ready") {
      return { ok: true, already: true, document: this.toDocument(doc) };
    }
    if (doc.status !== "pending_upload") return { ok: false, reason: "bad_state" };

    // All or nothing, like the SQL transaction: check every page first.
    const pages = new Set<number>();
    for (const sheet of input.sheets) {
      if (pages.has(sheet.pageNo)) throw new Error("duplicate_page");
      pages.add(sheet.pageNo);
      if (
        sheet.scaleRatio !== null &&
        (sheet.scaleRatio < 1 || sheet.scaleRatio > 10_000)
      ) {
        throw new RangeError("invalid_scale");
      }
    }
    for (const sheet of input.sheets) {
      const row: SheetRow = {
        id: randomUUID(),
        documentId: doc.id,
        projectId: doc.projectId,
        userId: doc.userId,
        pageNo: sheet.pageNo,
        widthPt: sheet.widthPt,
        heightPt: sheet.heightPt,
        scaleRatio: sheet.scaleRatio,
        scaleSource: sheet.scaleSource,
        status: "uploaded",
        needsRecalc: false,
        createdAt: input.now,
      };
      this.sheets.set(row.id, row);
    }
    doc.status = "ready";
    doc.pageCount = input.pageCount;
    return { ok: true, already: false, document: this.toDocument(doc) };
  }

  async abandonDocument(input: {
    userId: string;
    documentId: string;
  }): Promise<AbandonDocumentResult> {
    const doc = this.ownedDocument(input.userId, input.documentId);
    if (!doc) return { ok: false, reason: "not_found" };
    if (doc.status !== "pending_upload") return { ok: false, reason: "not_pending" };
    this.documents.delete(doc.id);
    return { ok: true, storagePath: doc.storagePath };
  }

  async listStalePendingDocuments(input: {
    before: Date;
    limit: number;
  }): Promise<StalePendingDocument[]> {
    return [...this.documents.values()]
      .filter((doc) => doc.status === "pending_upload" && doc.createdAt < input.before)
      .sort(
        (a, b) =>
          a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id),
      )
      .slice(0, Math.max(input.limit, 0))
      .map((doc) => ({ id: doc.id, userId: doc.userId, storagePath: doc.storagePath }));
  }

  async getSheet(input: {
    userId: string;
    sheetId: string;
  }): Promise<SheetRecord | null> {
    const row = this.sheets.get(input.sheetId);
    return row?.userId === input.userId ? this.toSheet(row) : null;
  }

  async setSheetScale(input: {
    userId: string;
    sheetId: string;
    ratio: number;
    now: Date;
  }): Promise<SetScaleResult> {
    const row = this.sheets.get(input.sheetId);
    if (!row || row.userId !== input.userId) return { ok: false, reason: "not_found" };
    if (!Number.isInteger(input.ratio) || input.ratio < 1 || input.ratio > 10_000) {
      throw new RangeError("invalid_scale");
    }
    const previousRatio = row.scaleRatio;
    const previousSource = row.scaleSource;
    const source: ScaleSource =
      previousSource === "detected" && previousRatio === input.ratio
        ? "detected"
        : "manual";
    row.needsRecalc =
      row.needsRecalc || (row.status === "ready" && previousRatio !== input.ratio);
    row.scaleRatio = input.ratio;
    row.scaleSource = source;
    return { ok: true, sheet: this.toSheet(row), previousRatio, previousSource };
  }

  async userExists(email: string): Promise<boolean> {
    return this.directory.findByEmail(email) !== undefined;
  }

  // Test and demo support (the SQL side gets this from the seed and from `auth.users`).

  /** Load a sheet that already exists (demo data); the project and document must exist. */
  seedProject(row: ProjectRow): void {
    this.projects.set(row.id, row);
  }

  seedDocument(row: DocumentRow): void {
    this.documents.set(row.id, row);
  }

  seedSheet(row: SheetRow): void {
    this.sheets.set(row.id, row);
  }
}

export type { DocumentRow, ProjectRow, SheetRow };
