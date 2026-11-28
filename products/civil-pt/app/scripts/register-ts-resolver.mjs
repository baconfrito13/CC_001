/**
 * Lets `node --experimental-strip-types` run the app's TypeScript sources, which import their
 * siblings the way the bundler does (`./errors`, no extension). Use it with
 * `node --import ./scripts/register-ts-resolver.mjs script.mts`.
 */
import { register } from "node:module";

register("./ts-resolver.mjs", import.meta.url);
