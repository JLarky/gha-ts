// Compile-time only checks for scoped expr tags.
// These lines are validated by `tsc --noEmit` via `mise run typecheck`.

import { ctx, pr, push } from "../src/context";
import { prNS, pushNS } from "../src/events-namespaces";

// Good cases (should type-check)
const _okPush = push.expr`${ctx.github.event.ref}`;
const _okPr = pr.expr`${ctx.github.event.pull_request.number}`;

// Bad cases (should be type errors)
// @ts-expect-error - PR fragment is not allowed in push scope
const _bad1 = push.expr`${prNS.head.ref}`;
// @ts-expect-error - Push fragment is not allowed in PR scope
const _bad2 = pr.expr`${pushNS.ref}`;
