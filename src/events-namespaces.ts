import { token, type Fragment } from "./expr-core";
import type { EventName, EventPayload } from "./events-generated";
import type { Scope } from "./event-types";

// Helper types
type Keys<T> = Extract<keyof T, string>;
type Obj<T> = Extract<T, object>;

type FragmentTree<T, S extends Scope> = {
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

export function makeEventNamespace<N extends EventName, S extends Scope>(
  name: N,
  scope: S,
): FragmentTree<EventPayload<N>, S> {
  return makeProxy<S>(`github.event.${name}`) as FragmentTree<
    EventPayload<N>,
    S
  >;
}

export const events = {
  push: makeEventNamespace("push", "push"),
  pull_request: makeEventNamespace("pull_request", "pr"),
  // more can be added as needed
} as const;

export const pushNS = events.push;
export const prNS = events.pull_request;
