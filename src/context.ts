import { ctx as baseCtx } from "./context-generated";
import { events, pushNS, prNS } from "./events-namespaces";
export const ctx = Object.assign({}, baseCtx, {
  events,
  push: pushNS,
  pull_request: prNS,
});
export * from "./expr-core";
