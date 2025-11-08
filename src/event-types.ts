// Type utilities for event-scoped typing (compile-time only)
import type { EventName, EventPayload } from "./events-generated";

export type Scope = "any" | "pr" | "push" | "release" | "workflow_dispatch";

type Keys<T> = Extract<keyof T, string>;

// DotPaths: build "a.b.c" union strings for object T
export type DotPaths<T, P extends string = ""> = T extends object
  ?
      | (P extends "" ? never : P)
      | {
          [K in Keys<T>]: DotPaths<T[K], `${P}${P extends "" ? "" : "."}${K}`>;
        }[Keys<T>]
  : P extends ""
    ? never
    : P;

// Validate event path strings like "pull_request.head.ref"
export type IsValidEventPath<P extends string> =
  P extends `${infer N}.${infer Rest}`
    ? N extends EventName
      ? Rest extends DotPaths<EventPayload<N>>
        ? P
        : never
      : never
    : never;

export type ValidEventPath<P extends string> = P & IsValidEventPath<P>;
