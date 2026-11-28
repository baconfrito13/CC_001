import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { DEV_SESSION_SECRET, signSession } from "@/lib/auth/mock";
import { config, proxy } from "@/proxy";

const USER = "a1000000-0000-4000-8000-000000000001";
const inAnHour = () => Math.floor(Date.now() / 1000) + 3600;

const call = (path: string, cookie?: string) =>
  proxy(
    new NextRequest(`http://localhost:3000${path}`, {
      headers: cookie ? { cookie } : {},
    }),
  );

describe("proxy: the signed-in area (US-01.7, T-14)", () => {
  it("US-01.7: without a session /pt/app/projetos redirects (302) to /pt/entrar and remembers where to come back", async () => {
    const response = await call("/pt/app/projetos");
    expect(response.status).toBe(302);
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe("/pt/entrar");
    expect(location.searchParams.get("next")).toBe("/pt/app/projetos");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("covers every page of the area, in both languages, and keeps the query", async () => {
    for (const [path, entrar] of [
      ["/pt/app", "/pt/entrar"],
      ["/en/app", "/en/entrar"],
      ["/en/app/projetos/3f2a1c9e-0000-4000-8000-000000000001?x=1", "/en/entrar"],
    ] as const) {
      const response = await call(path);
      expect(response.status, path).toBe(302);
      const location = new URL(response.headers.get("location") ?? "");
      expect(location.pathname).toBe(entrar);
      expect(location.searchParams.get("next")).toBe(path);
    }
  });

  it("lets a valid mock session through", async () => {
    const cookie = `rp_session=${signSession(USER, inAnHour(), DEV_SESSION_SECRET)}`;
    const response = await call("/pt/app/projetos", cookie);
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("refuses a forged, tampered or expired session cookie", async () => {
    const good = signSession(USER, inAnHour(), DEV_SESSION_SECRET);
    const other = signSession(USER, inAnHour(), "another-secret-0123456789");
    const expired = signSession(
      USER,
      Math.floor(Date.now() / 1000) - 10,
      DEV_SESSION_SECRET,
    );
    for (const value of [
      other,
      expired,
      good.replace(USER, "b1000000-0000-4000-8000-000000000009"),
      "x",
      "",
    ]) {
      const response = await call("/pt/app/projetos", `rp_session=${value}`);
      expect(response.status, value).toBe(302);
    }
  });

  it("does not gate the public pages, the sign-in pages or the confirmation page", async () => {
    for (const path of [
      "/pt",
      "/pt/entrar",
      "/pt/auth/confirm?token_hash=x&type=email",
      "/en/pricing",
      "/pt/legal/privacy",
      "/pt/application",
    ]) {
      const response = await call(path);
      expect(response.status, path).toBe(200);
    }
  });

  it("keeps API routes out of the proxy (each handler checks the user itself)", () => {
    const matcher = new RegExp(`^${config.matcher[0]}$`);
    expect(matcher.test("/api/projects")).toBe(false);
    expect(matcher.test("/pt/app/projetos")).toBe(true);
  });
});
