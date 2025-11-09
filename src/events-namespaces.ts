import { token, type Fragment } from "./expr-core";
import type { EventPayload } from "./events-generated";
import type { Scope } from "./event-types";

// Helper types
type Keys<T> = Extract<keyof T, string>;
type Obj<T> = Extract<T, object>;

export type FragmentTree<T, S extends Scope> = {
  [K in Keys<T>]: [Obj<T[K]>] extends [never]
    ? Fragment<S>
    : FragmentTree<Obj<T[K]>, S>;
} & Fragment<S>;

function makeProxy<S extends Scope>(prefix: string): FragmentTree<any, S> {
  const handler: ProxyHandler<any> = {
    get(_t, prop) {
      if (prop === "inner") return `${prefix}`;
      if (prop === "toString") return () => `${prefix}`;
      if (prop === "wrap") return () => token<S>(`${prefix}`).wrap();
      return makeProxy<S>(prefix ? `${prefix}.${String(prop)}` : String(prop));
    },
    has(_t, prop) {
      if (prop === "inner" || prop === "wrap" || prop === "toString")
        return true;
      return true;
    },
  };
  // Return a callable-ish object with "inner" getter through proxy
  return new Proxy({}, handler) as FragmentTree<any, S>;
}

export function makeEventNamespace<T, S extends Scope>(
  basePath: string,
  _scope: S,
): FragmentTree<T, S> {
  const prefix = basePath ? `github.event.${basePath}` : `github.event`;
  return makeProxy<S>(prefix) as FragmentTree<T, S>;
}

export const events = {
  // push event fields live at the root of event payload
  push: makeEventNamespace<EventPayload<"push">, "push">("", "push"),
  // pull_request event fields live under the 'pull_request' property
  pull_request: makeEventNamespace<
    EventPayload<"pull_request">["pull_request"],
    "pr"
  >("pull_request", "pr"),
  // more can be added as needed
} as const;

export const pushNS = events.push;
export const prNS = events.pull_request;
