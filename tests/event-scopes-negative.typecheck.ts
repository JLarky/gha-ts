// Compile-time only checks for scoped expr tags.
// These lines are validated by `tsc --noEmit` via `mise run typecheck`.

import { ctx, pr, push } from "../src/context";

// Good cases (should type-check)
const okPush = push.expr`${ctx.push.ref}`;
const okPr = pr.expr`${ctx.pull_request.number}`;

// Bad cases (should be type errors)
// @ts-expect-error - PR fragment is not allowed in push scope
const bad1 = push.expr`${ctx.pull_request.head.ref}`;
// @ts-expect-error - Push fragment is not allowed in PR scope
const bad2 = pr.expr`${ctx.push.ref}`;
