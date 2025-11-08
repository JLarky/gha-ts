import { describe, expect, test } from "bun:test";
import { expr, token, wrap, unwrap, raw, toInner } from "../src/expr-core";

describe("expr-core", () => {
  test("token + expr produces a wrapped expression", () => {
    const out = expr`${token("github.ref")}`;
    expect(out).toBe("${{ github.ref }}");
  });

  test("auto-quotes plain strings", () => {
    const out = expr`${"hello"}`;
    expect(out).toBe("${{ 'hello' }}");
  });

  test("raw preserves given literal", () => {
    const out = expr`${raw("a'b")}`;
    expect(out).toBe("${{ 'a\\'b' }}");
  });

  test("wrap and unwrap are inverse", () => {
    const w = wrap("github.sha");
    expect(w).toBe("${{ github.sha }}");
    expect(unwrap(w)).toBe("github.sha");
  });

  test("expr unwraps already-wrapped strings inside interpolation", () => {
    const a = expr`${token("github.workflow")}`;
    const b = expr`${a}`; // should unwrap and re-wrap
    expect(a).toBe(b);
  });

  test("toInner returns raw token unchanged", () => {
    expect(toInner("github.ref")).toBe("github.ref");
  });
});

