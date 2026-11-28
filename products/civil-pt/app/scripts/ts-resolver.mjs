/** Module resolution hook: tries `<specifier>.ts` for extensionless relative imports. */
export async function resolve(specifier, context, nextResolve) {
  if (/^\.{1,2}\//.test(specifier) && !/\.[a-z]+$/i.test(specifier)) {
    try {
      return await nextResolve(`${specifier}.ts`, context);
    } catch {
      // Not a TypeScript sibling: fall through to the default resolution.
    }
  }
  return nextResolve(specifier, context);
}
