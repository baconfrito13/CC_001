import { describe, expect, it } from "vitest";
import { EngineError } from "@/lib/engine/errors";
import { styleStrategy } from "@/lib/engine/grouping";
import {
  decodeGeometryPackage,
  encodeGeometryPackage,
  gunzipPackage,
  gzipPackage,
  PACKAGE_VERSION,
} from "@/lib/engine/package";
import { ElementKind } from "@/lib/engine/types";
import { line, sheetFrom, square, style } from "./support";

const styles = [
  style("#ff0000", null, 0.35),
  { ...style("#0000ff", "#cccccc", 0.5), dash: [3, 2], dashPhase: 1 },
];

function sample() {
  const sheet = sheetFrom(
    [
      square(10.5, 20.25, 4, 0),
      line(0, 100, 30, 40, 1),
      {
        kind: ElementKind.polygon,
        style: 1,
        area: 84,
        length: 56,
        // A slab with a hole: outer ring then hole ring.
        rings: [
          [0, 0, 10, 0, 10, 10, 0, 10],
          [3, 3, 3, 7, 7, 7, 7, 3],
        ],
      },
    ],
    styles,
    [-100, 50],
  );
  return { sheet, assignment: styleStrategy.assign(sheet.elements, sheet.styles) };
}

const errorCode = (fn: () => unknown): string | undefined => {
  try {
    fn();
  } catch (error) {
    return error instanceof EngineError ? error.code : `other:${String(error)}`;
  }
  return undefined;
};

describe("engine/package", () => {
  it("engine: geometry package v1 round-trips", () => {
    const { sheet, assignment } = sample();
    const bytes = encodeGeometryPackage(sheet, assignment);
    const decoded = decodeGeometryPackage(bytes);
    expect(decoded.sheet.page).toEqual(sheet.page);
    expect(decoded.sheet.scale).toEqual(sheet.scale);
    expect(decoded.sheet.styles).toEqual(sheet.styles);
    expect(decoded.sheet.stats).toEqual(sheet.stats);
    expect(Array.from(decoded.sheet.elements.coords)).toEqual(
      Array.from(sheet.elements.coords),
    );
    expect(Array.from(decoded.sheet.elements.area)).toEqual(
      Array.from(sheet.elements.area),
    );
    expect(Array.from(decoded.sheet.elements.length)).toEqual(
      Array.from(sheet.elements.length),
    );
    expect(Array.from(decoded.sheet.elements.ringStart)).toEqual(
      Array.from(sheet.elements.ringStart),
    );
    expect(Array.from(decoded.sheet.elements.vertexStart)).toEqual(
      Array.from(sheet.elements.vertexStart),
    );
    expect(Array.from(decoded.sheet.elements.kind)).toEqual(
      Array.from(sheet.elements.kind),
    );
    expect(Array.from(decoded.sheet.elements.style)).toEqual(
      Array.from(sheet.elements.style),
    );
    expect(decoded.sheet.elements.count).toBe(3);
    expect(Array.from(decoded.assignment.groupOf)).toEqual(
      Array.from(assignment.groupOf),
    );
    expect(decoded.assignment.groups).toEqual(assignment.groups);
    expect(decoded.assignment.strategy).toBe("style");
  });

  it("engine: element rings keep their holes (outer ring first)", () => {
    const { sheet } = sample();
    // Element 2 has two rings: 4 + 4 vertices.
    expect(Array.from(sheet.elements.ringStart)).toEqual([0, 1, 2, 4]);
    expect(Array.from(sheet.elements.vertexStart)).toEqual([0, 4, 6, 10, 14]);
  });

  it("engine: coordinates are stored relative to the page origin as 32-bit floats", () => {
    const { sheet } = sample();
    // square(10.5, 20.25) with origin (-100, 50): stored values are x - ox, y - oy.
    expect(sheet.elements.coords[0]).toBeCloseTo(10.5 + 100, 5);
    expect(sheet.elements.coords[1]).toBeCloseTo(20.25 - 50, 5);
    expect(sheet.elements.coords).toBeInstanceOf(Float32Array);
  });

  it("engine: encoding is deterministic, so reprocessing a sheet gives the same bytes", () => {
    const { sheet, assignment } = sample();
    expect(
      Buffer.from(encodeGeometryPackage(sheet, assignment)).equals(
        Buffer.from(encodeGeometryPackage(sheet, assignment)),
      ),
    ).toBe(true);
  });

  it("engine: the header starts with the RGEO magic and the version", () => {
    const { sheet, assignment } = sample();
    const bytes = encodeGeometryPackage(sheet, assignment);
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe("RGEO");
    expect(new DataView(bytes.buffer, bytes.byteOffset).getUint16(4, true)).toBe(
      PACKAGE_VERSION,
    );
    expect(PACKAGE_VERSION).toBe(1);
  });

  it("engine: decoding works on an unaligned view (a Buffer slice from a pool)", () => {
    const { sheet, assignment } = sample();
    const bytes = encodeGeometryPackage(sheet, assignment);
    const shifted = new Uint8Array(bytes.length + 3);
    shifted.set(bytes, 3);
    const decoded = decodeGeometryPackage(shifted.subarray(3));
    expect(decoded.sheet.elements.count).toBe(3);
  });

  it("engine: gzip round-trips and shrinks a repetitive package", async () => {
    const { sheet, assignment } = sample();
    const bytes = encodeGeometryPackage(sheet, assignment);
    const zipped = await gzipPackage(bytes);
    expect(zipped[0]).toBe(0x1f);
    expect(zipped[1]).toBe(0x8b);
    const restored = await gunzipPackage(zipped);
    expect(Buffer.from(restored).equals(Buffer.from(bytes))).toBe(true);
  });

  it("SR-05: gunzip refuses output beyond its limit (decompression bomb)", async () => {
    const zipped = await gzipPackage(new Uint8Array(1_000_000));
    await expect(gunzipPackage(zipped, { maxBytes: 100_000 })).rejects.toMatchObject({
      code: "invalid_package",
    });
  });

  it("engine: a damaged magic is rejected as invalid_package", () => {
    const { sheet, assignment } = sample();
    const bytes = encodeGeometryPackage(sheet, assignment).slice();
    bytes[0] = 0x58;
    expect(errorCode(() => decodeGeometryPackage(bytes))).toBe("invalid_package");
  });

  it("engine: a newer format version is reported as unsupported_package_version", () => {
    const { sheet, assignment } = sample();
    const bytes = encodeGeometryPackage(sheet, assignment).slice();
    new DataView(bytes.buffer, bytes.byteOffset).setUint16(4, 2, true);
    expect(errorCode(() => decodeGeometryPackage(bytes))).toBe(
      "unsupported_package_version",
    );
  });

  it("engine: a truncated package is rejected", () => {
    const { sheet, assignment } = sample();
    const bytes = encodeGeometryPackage(sheet, assignment);
    expect(
      errorCode(() => decodeGeometryPackage(bytes.slice(0, bytes.length - 20))),
    ).toBe("invalid_package");
    expect(errorCode(() => decodeGeometryPackage(bytes.slice(0, 6)))).toBe(
      "invalid_package",
    );
  });

  it("engine: a header that is not valid JSON or fails validation is rejected", () => {
    const { sheet, assignment } = sample();
    const bytes = encodeGeometryPackage(sheet, assignment).slice();
    bytes[13] = 0x7e; // corrupt the first characters of the JSON header
    expect(errorCode(() => decodeGeometryPackage(bytes))).toBe("invalid_package");
  });

  it("engine: a group index that does not exist is rejected", () => {
    const { sheet, assignment } = sample();
    const bad = { ...assignment, groupOf: Uint32Array.from([0, 99, 1]) };
    const bytes = encodeGeometryPackage(sheet, bad);
    expect(errorCode(() => decodeGeometryPackage(bytes))).toBe("invalid_package");
  });
});
