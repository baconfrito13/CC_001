/**
 * A tiny, deterministic PDF writer for synthetic test sheets (never real tender drawings).
 *
 * It writes only what the engine tests need: pages with a content stream, form XObjects,
 * image XObjects, optional-content layers (OCG) and page boxes. No fonts are embedded. With
 * `compress: false` (the default) the output is plain ASCII, so the committed fixtures are
 * byte-for-byte reproducible on every Node version; the large in-memory fixtures use Flate.
 */
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";

/** Millimetres to PDF points. */
export const MM = 72 / 25.4;

/** Cubic Bézier constant for a quarter circle: 4/3 * (sqrt(2) - 1). */
const KAPPA = 0.5522847498307936;

/** Compact, locale-free number formatting for content streams. */
export function num(value: number): string {
  if (!Number.isFinite(value)) throw new Error(`Cannot write ${value} to a PDF`);
  return String(Number(value.toFixed(4)));
}

/** Content stream writer: one method per PDF operator the fixtures need. */
export class Content {
  private readonly parts: string[] = [];

  raw(text: string): this {
    this.parts.push(text);
    return this;
  }

  save(): this {
    return this.raw("q");
  }
  restore(): this {
    return this.raw("Q");
  }
  /** `cm`: concatenate a matrix to the CTM. */
  cm(a: number, b: number, c: number, d: number, e: number, f: number): this {
    return this.raw(`${[a, b, c, d, e, f].map(num).join(" ")} cm`);
  }
  translate(x: number, y: number): this {
    return this.cm(1, 0, 0, 1, x, y);
  }
  scale(sx: number, sy: number = sx): this {
    return this.cm(sx, 0, 0, sy, 0, 0);
  }
  rotate(degrees: number): this {
    const r = (degrees * Math.PI) / 180;
    return this.cm(Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0);
  }

  strokeRgb(r: number, g: number, b: number): this {
    return this.raw(`${num(r)} ${num(g)} ${num(b)} RG`);
  }
  fillRgb(r: number, g: number, b: number): this {
    return this.raw(`${num(r)} ${num(g)} ${num(b)} rg`);
  }
  strokeGray(g: number): this {
    return this.raw(`${num(g)} G`);
  }
  fillGray(g: number): this {
    return this.raw(`${num(g)} g`);
  }
  strokeCmyk(c: number, m: number, y: number, k: number): this {
    return this.raw(`${[c, m, y, k].map(num).join(" ")} K`);
  }
  fillCmyk(c: number, m: number, y: number, k: number): this {
    return this.raw(`${[c, m, y, k].map(num).join(" ")} k`);
  }
  lineWidth(width: number): this {
    return this.raw(`${num(width)} w`);
  }
  dash(pattern: readonly number[], phase = 0): this {
    return this.raw(`[${pattern.map(num).join(" ")}] ${num(phase)} d`);
  }

  moveTo(x: number, y: number): this {
    return this.raw(`${num(x)} ${num(y)} m`);
  }
  lineTo(x: number, y: number): this {
    return this.raw(`${num(x)} ${num(y)} l`);
  }
  curveTo(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): this {
    return this.raw(`${[x1, y1, x2, y2, x3, y3].map(num).join(" ")} c`);
  }
  rect(x: number, y: number, w: number, h: number): this {
    return this.raw(`${[x, y, w, h].map(num).join(" ")} re`);
  }
  closePath(): this {
    return this.raw("h");
  }
  /** A circle as four cubic Béziers (what CAD and reportlab export), counter-clockwise. */
  circle(cx: number, cy: number, r: number): this {
    const k = KAPPA * r;
    return this.moveTo(cx + r, cy)
      .curveTo(cx + r, cy + k, cx + k, cy + r, cx, cy + r)
      .curveTo(cx - k, cy + r, cx - r, cy + k, cx - r, cy)
      .curveTo(cx - r, cy - k, cx - k, cy - r, cx, cy - r)
      .curveTo(cx + k, cy - r, cx + r, cy - k, cx + r, cy)
      .closePath();
  }
  /** A polygon from absolute points (open until `closePath`). */
  polyline(points: ReadonlyArray<readonly [number, number]>): this {
    points.forEach(([x, y], index) => {
      if (index === 0) this.moveTo(x, y);
      else this.lineTo(x, y);
    });
    return this;
  }

  /** `S` */
  stroke(): this {
    return this.raw("S");
  }
  /** `s` */
  closeStroke(): this {
    return this.raw("s");
  }
  /** `f` (non-zero winding) */
  fill(): this {
    return this.raw("f");
  }
  /** `f*` (even-odd) */
  fillEvenOdd(): this {
    return this.raw("f*");
  }
  /** `B` */
  fillStroke(): this {
    return this.raw("B");
  }
  /** `B*` */
  fillStrokeEvenOdd(): this {
    return this.raw("B*");
  }
  /** `n`: end the path without painting (used with a clip). */
  endPath(): this {
    return this.raw("n");
  }
  /** `W n`: clip to the current path. */
  clip(): this {
    return this.raw("W n");
  }
  /** `Do` */
  paintXObject(name: string): this {
    return this.raw(`/${name} Do`);
  }
  /** `gs`: apply a named ExtGState. */
  setGraphicsState(name: string): this {
    return this.raw(`/${name} gs`);
  }
  beginLayer(propertyName: string): this {
    return this.raw(`/OC /${propertyName} BDC`);
  }
  endLayer(): this {
    return this.raw("EMC");
  }

  toString(): string {
    return `${this.parts.join("\n")}\n`;
  }
}

export interface PageOptions {
  /** Media box width and height in points. */
  width: number;
  height: number;
  /** Media box origin (default 0,0): CAD exports often use a non-zero origin. */
  origin?: readonly [number, number];
  rotate?: 0 | 90 | 180 | 270;
  /** `/UserUnit`: page units in 1/72 inch multiples (default 1). */
  userUnit?: number;
}

export interface PageResources {
  /** Name to object id, from `addForm` / `addImage`. */
  xobjects?: Record<string, number>;
  /** Property list name to OCG object id, from `addLayer`. */
  properties?: Record<string, number>;
  /** Graphics state name to ExtGState object id, from `addGraphicsState`. */
  graphicsStates?: Record<string, number>;
}

interface PageRecord {
  options: PageOptions;
  content: Content;
  resources: PageResources;
}

const ascii = (text: string): Uint8Array => new TextEncoder().encode(text);

/** Standard security handler padding string (PDF 32000-1, algorithm 2). */
const PASSWORD_PAD = Buffer.from(
  "28BF4E5E4E758A4164004E56FFFA01082E2E00B6D0683E802F0CA9FE6453697A",
  "hex",
);
const DOCUMENT_ID = Buffer.from("00112233445566778899aabbccddeeff", "hex");

function rc4(key: Buffer, data: Buffer): Buffer {
  const state = Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + (state[i] as number) + (key[i % key.length] as number)) & 255;
    [state[i], state[j]] = [state[j] as number, state[i] as number];
  }
  const out = Buffer.alloc(data.length);
  let a = 0;
  let b = 0;
  for (let k = 0; k < data.length; k++) {
    a = (a + 1) & 255;
    b = (b + (state[a] as number)) & 255;
    [state[a], state[b]] = [state[b] as number, state[a] as number];
    out[k] =
      (data[k] as number) ^
      (state[((state[a] as number) + (state[b] as number)) & 255] as number);
  }
  return out;
}

/** The /Encrypt dictionary of a 40-bit RC4 file (revision 2) that needs `password` to open. */
function encryptionDictionary(password: string): string {
  const owner = Buffer.alloc(32, 0x4f);
  const permissions = Buffer.alloc(4);
  permissions.writeInt32LE(-4);
  const padded = Buffer.concat([Buffer.from(password, "latin1"), PASSWORD_PAD]).subarray(
    0,
    32,
  );
  const key = createHash("md5")
    .update(padded)
    .update(owner)
    .update(permissions)
    .update(DOCUMENT_ID)
    .digest()
    .subarray(0, 5);
  const user = rc4(key, PASSWORD_PAD);
  return `<< /Filter /Standard /V 1 /R 2 /Length 40 /P -4 /O <${owner.toString("hex")}> /U <${user.toString("hex")}> >>`;
}

function concat(chunks: readonly Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

export class PdfBuilder {
  /** Objects 1 (catalog) and 2 (page tree) are reserved; extras start at 3. */
  private readonly extraObjects: Uint8Array[] = [];
  private readonly pages: PageRecord[] = [];
  private readonly hiddenLayers: number[] = [];
  private readonly allLayers: number[] = [];
  private readonly compress: boolean;

  constructor(options: { compress?: boolean } = {}) {
    this.compress = options.compress ?? false;
  }

  private nextId(): number {
    return 3 + this.extraObjects.length;
  }

  private addObject(body: Uint8Array): number {
    const id = this.nextId();
    this.extraObjects.push(body);
    return id;
  }

  private streamObject(
    dict: string,
    data: Uint8Array,
    options: { compress: boolean } = { compress: this.compress },
  ): Uint8Array {
    const payload = options.compress ? deflateSync(data, { level: 6 }) : data;
    const filter = options.compress ? " /Filter /FlateDecode" : "";
    return concat([
      ascii(`<< ${dict}${filter} /Length ${payload.length} >>\nstream\n`),
      payload,
      ascii("\nendstream"),
    ]);
  }

  /** Optional-content layer (`/OCG`). Hidden layers are listed under `/D /OFF`. */
  addLayer(name: string, visible: boolean): number {
    const id = this.addObject(ascii(`<< /Type /OCG /Name (${name}) >>`));
    this.allLayers.push(id);
    if (!visible) this.hiddenLayers.push(id);
    return id;
  }

  /** An ExtGState dictionary body such as `/LW 2 /D [[4 1] 0]`. */
  addGraphicsState(entries: string): number {
    return this.addObject(ascii(`<< /Type /ExtGState ${entries} >>`));
  }

  /** A form XObject. `matrix` is the form's own `/Matrix` (default identity). */
  addForm(
    bbox: readonly [number, number, number, number],
    content: Content,
    options: { matrix?: readonly number[]; resources?: PageResources } = {},
  ): number {
    const matrix = options.matrix
      ? ` /Matrix [${options.matrix.map(num).join(" ")}]`
      : "";
    const dict = `/Type /XObject /Subtype /Form /BBox [${bbox.map(num).join(" ")}]${matrix}${this.resourcesDict(options.resources)}`;
    return this.addObject(this.streamObject(dict, ascii(content.toString())));
  }

  /** An RGB image XObject; pixel bytes are written as ASCII hex so the fixture stays text. */
  addImage(width: number, height: number, rgb: Uint8Array): number {
    if (rgb.length !== width * height * 3)
      throw new Error("rgb must hold width*height*3 bytes");
    const hex = `${Array.from(rgb, (b) => b.toString(16).padStart(2, "0")).join("")}>`;
    const dict = `/Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /ASCIIHexDecode`;
    return this.addObject(this.streamObject(dict, ascii(hex), { compress: false }));
  }

  private resourcesDict(resources?: PageResources): string {
    const xobjects = Object.entries(resources?.xobjects ?? {})
      .map(([name, id]) => `/${name} ${id} 0 R`)
      .join(" ");
    const properties = Object.entries(resources?.properties ?? {})
      .map(([name, id]) => `/${name} ${id} 0 R`)
      .join(" ");
    const states = Object.entries(resources?.graphicsStates ?? {})
      .map(([name, id]) => `/${name} ${id} 0 R`)
      .join(" ");
    const parts = [
      xobjects ? `/XObject << ${xobjects} >>` : "",
      properties ? `/Properties << ${properties} >>` : "",
      states ? `/ExtGState << ${states} >>` : "",
    ].filter(Boolean);
    return ` /Resources << ${parts.join(" ")} >>`;
  }

  addPage(options: PageOptions, content: Content, resources: PageResources = {}): this {
    this.pages.push({ options, content, resources });
    return this;
  }

  /**
   * `userPassword` adds a standard security handler dictionary that demands that password. The
   * streams stay in the clear: the file only exists to prove that a password-protected PDF is
   * refused before any content is read, so it is not a faithful encrypted document.
   */
  build(options: { userPassword?: string } = {}): Uint8Array {
    if (this.pages.length === 0) throw new Error("A PDF needs at least one page");
    // Allocate page and content objects after the extras, so their ids are stable.
    const bodies: Uint8Array[] = [...this.extraObjects];
    const pageIds: number[] = [];
    for (const page of this.pages) {
      const contentId = 3 + bodies.length;
      bodies.push(this.streamObject("", ascii(page.content.toString())));
      const pageId = 3 + bodies.length;
      pageIds.push(pageId);
      const { width, height, origin = [0, 0], rotate, userUnit } = page.options;
      const box = `[${num(origin[0])} ${num(origin[1])} ${num(origin[0] + width)} ${num(origin[1] + height)}]`;
      bodies.push(
        ascii(
          `<< /Type /Page /Parent 2 0 R /MediaBox ${box}` +
            (rotate ? ` /Rotate ${rotate}` : "") +
            (userUnit && userUnit !== 1 ? ` /UserUnit ${num(userUnit)}` : "") +
            `${this.resourcesDict(page.resources)} /Contents ${contentId} 0 R >>`,
        ),
      );
    }
    const ocProperties =
      this.allLayers.length > 0
        ? ` /OCProperties << /OCGs [${this.allLayers.map((id) => `${id} 0 R`).join(" ")}] /D << /BaseState /ON /OFF [${this.hiddenLayers
            .map((id) => `${id} 0 R`)
            .join(" ")}] >> >>`
        : "";
    const catalog = ascii(`<< /Type /Catalog /Pages 2 0 R${ocProperties} >>`);
    const tree = ascii(
      `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`,
    );
    const all = [catalog, tree, ...bodies];
    let encryptRef = "";
    if (options.userPassword !== undefined) {
      all.push(ascii(encryptionDictionary(options.userPassword)));
      encryptRef = ` /Encrypt ${all.length} 0 R /ID [<${DOCUMENT_ID.toString("hex")}> <${DOCUMENT_ID.toString("hex")}>]`;
    }

    const chunks: Uint8Array[] = [ascii("%PDF-1.7\n%\xE2\xE3\xCF\xD3\n")];
    const offsets: number[] = [];
    let position = chunks[0]?.length ?? 0;
    all.forEach((body, index) => {
      offsets.push(position);
      const head = ascii(`${index + 1} 0 obj\n`);
      const tail = ascii("\nendobj\n");
      chunks.push(head, body, tail);
      position += head.length + body.length + tail.length;
    });
    const xref = [
      `xref\n0 ${all.length + 1}\n0000000000 65535 f \n`,
      ...offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`),
      `trailer\n<< /Size ${all.length + 1} /Root 1 0 R${encryptRef} >>\nstartxref\n${position}\n%%EOF\n`,
    ].join("");
    chunks.push(ascii(xref));
    return concat(chunks);
  }
}
