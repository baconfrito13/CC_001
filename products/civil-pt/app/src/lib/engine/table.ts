import { ElementKind, type ElementKindCode, type ElementTable } from "./types";

type TypedArray = Uint8Array | Uint32Array | Float32Array | Float64Array;

/** A typed array that doubles when full: the extractor does not know the element count upfront. */
class Growable<T extends TypedArray> {
  private data: T;
  private size = 0;
  private readonly create: (length: number) => T;

  constructor(create: (length: number) => T, initial = 1024) {
    this.create = create;
    this.data = create(initial);
  }

  get length(): number {
    return this.size;
  }

  push(value: number): void {
    if (this.size === this.data.length) {
      const bigger = this.create(this.data.length * 2);
      bigger.set(this.data);
      this.data = bigger;
    }
    this.data[this.size++] = value;
  }

  /** A trimmed copy that owns its memory. */
  finish(): T {
    return this.data.slice(0, this.size) as T;
  }
}

export interface ElementInput {
  kind: ElementKindCode;
  style: number;
  /** m² */
  area: number;
  /** m */
  length: number;
  /** Rings as flat x, y pairs in page points (outer ring first, then holes). */
  rings: ReadonlyArray<ArrayLike<number>>;
}

/**
 * Collects elements into an {@link ElementTable}. Coordinates are narrowed to 32 bits here, after
 * `origin` is subtracted so the numbers stay small (a CAD sheet can sit far from (0, 0)).
 */
export class ElementTableBuilder {
  private readonly kind = new Growable((n) => new Uint8Array(n));
  private readonly style = new Growable((n) => new Uint32Array(n));
  private readonly area = new Growable((n) => new Float64Array(n));
  private readonly length = new Growable((n) => new Float64Array(n));
  private readonly ringStart = new Growable((n) => new Uint32Array(n));
  private readonly vertexStart = new Growable((n) => new Uint32Array(n));
  private readonly coords = new Growable((n) => new Float32Array(n), 4096);
  private vertices = 0;
  private rings = 0;
  private readonly origin: readonly [number, number];

  constructor(origin: readonly [number, number] = [0, 0]) {
    this.origin = origin;
    this.ringStart.push(0);
    this.vertexStart.push(0);
  }

  get count(): number {
    return this.kind.length;
  }

  get vertexCount(): number {
    return this.vertices;
  }

  /** Adds an element and returns its index. */
  add(input: ElementInput): number {
    const index = this.kind.length;
    this.kind.push(
      input.kind === ElementKind.polygon ? ElementKind.polygon : ElementKind.polyline,
    );
    this.style.push(input.style);
    this.area.push(input.area);
    this.length.push(input.length);
    const [ox, oy] = this.origin;
    for (const ring of input.rings) {
      const n = ring.length / 2;
      for (let i = 0; i < n; i++) {
        this.coords.push((ring[2 * i] as number) - ox);
        this.coords.push((ring[2 * i + 1] as number) - oy);
      }
      this.vertices += n;
      this.rings += 1;
      this.vertexStart.push(this.vertices);
    }
    this.ringStart.push(this.rings);
    return index;
  }

  finish(): ElementTable {
    return {
      count: this.kind.length,
      kind: this.kind.finish(),
      style: this.style.finish(),
      area: this.area.finish(),
      length: this.length.finish(),
      ringStart: this.ringStart.finish(),
      vertexStart: this.vertexStart.finish(),
      coords: this.coords.finish(),
    };
  }
}
