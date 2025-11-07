import { describe, expect, test } from "bun:test";
import {
  ctx,
  expr,
  fn,
  raw,
  token,
  unwrap,
  wrap,
  WorkflowExpr,
} from "../src/context";

describe("context helpers", () => {
  test("tagged template builds wrapped expressions", () => {
    const result = expr`${ctx.github.ref}`;
    expect(result).toBe("${{ github.ref }}");
  });

  test("auto-quotes plain strings in expressions", () => {
    const result = expr`${ctx.github.workflow} == ${"main"}`;
    expect(unwrap(result)).toBe("github.workflow == 'main'");
  });

  test("allows nested expressions via unwrap", () => {
    const inner: WorkflowExpr = expr`${ctx.github.sha}`;
    const result = expr`${ctx.github.ref} == ${ctx.unwrap(inner)}`;
    expect(unwrap(result)).toBe("github.ref == github.sha");
  });

  test("fn helpers integrate with expr()", () => {
    const result = expr`${fn.contains(ctx.github.ref, "develop")}`;
    expect(unwrap(result)).toBe("contains(github.ref, 'develop')");
  });

  test("fn.coalesce renders joined arguments", () => {
    const result = expr`${fn.coalesce(ctx.github.head_ref, ctx.github.ref)}`;
    expect(unwrap(result)).toBe("coalesce(github.head_ref, github.ref)");
  });

  test("throws on double wrapping", () => {
    expect(() => wrap("${{ github.ref }}")).toThrow(/already wrapped/i);
  });

  test("ctx namespaces compose arbitrarily deep tokens", () => {
    const fragment = ctx.github.event.pull_request.head.sha;
    expect(fragment.inner).toBe("github.event.pull_request.head.sha");
    expect(fragment.wrap()).toBe("${{ github.event.pull_request.head.sha }}");
  });

  test("ctx helpers expose convenience methods", () => {
    expect(ctx.env.var("NODE_VERSION").inner).toBe("env.NODE_VERSION");
    expect(ctx.secrets.secret("API_KEY").wrap()).toBe("${{ secrets.API_KEY }}");
    expect(ctx.steps.output("build", "artifact").inner).toBe(
      "steps.build.outputs.artifact",
    );
    expect(ctx.needs.result("lint").wrap()).toBe(
      "${{ needs.lint.result }}",
    );
  });

  test("ctx token helper mirrors namespace fragments", () => {
    const viaToken = ctx.token("github.ref");
    expect(viaToken.inner).toBe(ctx.github.ref.inner);
    const direct = token("github.run_id");
    expect(direct.wrap()).toBe("${{ github.run_id }}");
  });

  test("raw helper preserves literal quoting", () => {
    const result = expr`${raw("literal value")}`;
    expect(unwrap(result)).toBe("'literal value'");
  });

  test("disallows undefined interpolations", () => {
    const value: string | undefined = undefined;
    expect(() => expr`${value}`).toThrow(/undefined/);
  });
});
