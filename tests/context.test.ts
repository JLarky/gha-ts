import { describe, expect, it } from "bun:test";
import {
  ctx,
  expr,
  fn,
  raw,
  wrap,
  unwrap,
} from "@jlarky/gha-ts/context";

describe("context helpers", () => {
  it("builds expressions with tokens and auto-quoted literals", () => {
    const expression = expr`${ctx.github.workflow} - ${"release"}`;
    expect(expression).toBe("${{ github.workflow - 'release' }}");
  });

  it("composes fragments safely with logical helpers", () => {
    const condition = ctx.github.head_ref.or(ctx.github.ref);
    expect(condition.wrap()).toBe("${{ (github.head_ref) || (github.ref) }}");
  });

  it("provides function helpers for GitHub expression built-ins", () => {
    const expression = expr`${fn.contains(ctx.github.ref, "main")}`;
    expect(expression).toBe("${{ contains(github.ref, 'main') }}");
  });

  it("throws when format template omits placeholders", () => {
    expect(() => fn.format("hello world")).toThrow(
      "format template must contain placeholders like {0}",
    );
  });

  it("throws when attempting to double wrap an expression", () => {
    expect(() => wrap("${{ github.ref }}")).toThrow(
      /Expression already wrapped/i,
    );
  });

  it("unwrap extracts the inner expression", () => {
    const expression = expr`${ctx.github.sha}`;
    expect(unwrap(expression)).toBe("github.sha");
  });

  it("hashFiles enforces at least one argument", () => {
    expect(() => fn.hashFiles()).toThrow("hashFiles requires at least one path argument");
  });

  it("exposes nested event helpers", () => {
    const title = ctx.github.event.pull_request.title.wrap();
    expect(title).toBe("${{ github.event.pull_request.title }}");
  });

  it("supports environment and secrets accessors", () => {
    const envVar = ctx.env.var("NODE_VERSION").wrap();
    const secret = ctx.secrets.secret("NPM_TOKEN").wrap();
    expect(envVar).toBe("${{ env.NODE_VERSION }}");
    expect(secret).toBe("${{ secrets.NPM_TOKEN }}");
  });

  it("allows raw literals for edge cases", () => {
    const expression = expr`${raw("value with 'quotes'")}`;
    expect(expression).toBe("${{ 'value with \\'quotes\\'' }}");
  });

  it("supports join helper with custom separators", () => {
    const expression = expr`${fn.join(ctx.matrix.value("node-version"), raw("|"))}`;
    expect(expression).toBe("${{ join(matrix.node-version, '|') }}");
  });

  it("can scope to a subset of namespaces", () => {
    const scoped = ctx.pick("github");
    expect(scoped.github.ref.wrap()).toBe("${{ github.ref }}");
    // @ts-expect-error secrets is not part of the scoped view
    type _ForbiddenSecrets = typeof scoped.secrets;
  });

  it("can scope environment variables to an allow list", () => {
    const env = ctx.env.scope("NODE_VERSION", "BUN_VERSION");
    expect(env.NODE_VERSION.wrap()).toBe("${{ env.NODE_VERSION }}");
    expect(env.BUN_VERSION.wrap()).toBe("${{ env.BUN_VERSION }}");
    // @ts-expect-error ACCESS_TOKEN is not part of the scope
    type _ForbiddenEnv = typeof env.ACCESS_TOKEN;
  });

  it("can scope secrets and vars similarly", () => {
    const secrets = ctx.secrets.scope("NPM_TOKEN");
    expect(secrets.NPM_TOKEN.wrap()).toBe("${{ secrets.NPM_TOKEN }}");
    const vars = ctx.vars.scope("CACHE_KEY");
    expect(vars.CACHE_KEY.wrap()).toBe("${{ vars.CACHE_KEY }}");
  });
});
