import { describe, expect, test } from "bun:test";
import { expr, ctx, fn, token, raw, wrap, unwrap } from "../src/expressions";
import type { WorkflowExpr, Fragment } from "../src/expressions";

describe("expressions", () => {
  test("expr creates wrapped expressions", () => {
    const result = expr`${ctx.github.ref}`;
    expect(result).toBe("${{ github.ref }}");
  });

  test("expr handles multiple interpolations", () => {
    const result = expr`${ctx.github.workflow} - ${ctx.github.ref}`;
    expect(result).toBe("${{ github.workflow - github.ref }}");
  });

  test("expr auto-quotes plain strings", () => {
    const result = expr`${fn.contains(ctx.github.ref, "develop")}`;
    expect(result).toBe("${{ contains(github.ref, 'develop') }}");
  });

  test("expr handles function helpers", () => {
    const result = expr`${fn.endsWith(ctx.github.head_ref, "-run-tests")}`;
    expect(result).toBe("${{ endsWith(github.head_ref, '-run-tests') }}");
  });

  test("expr handles logical operators in template", () => {
    const result = expr`${ctx.github.head_ref} || ${ctx.github.ref}`;
    expect(result).toBe("${{ github.head_ref || github.ref }}");
  });

  test("expr handles comparison operators", () => {
    const result = expr`${ctx.github.event_name} == 'merge_group'`;
    expect(result).toBe("${{ github.event_name == 'merge_group' }}");
  });

  test("token creates fragments", () => {
    const frag = token("github.ref");
    expect(frag.toString()).toBe("github.ref");
    expect(frag.wrap()).toBe("${{ github.ref }}");
  });

  test("raw creates quoted fragments", () => {
    const frag = raw("test'value");
    expect(frag.toString()).toBe("'test\\'value'");
  });

  test("wrap creates WorkflowExpr", () => {
    const result = wrap("github.ref");
    expect(result).toBe("${{ github.ref }}");
  });

  test("wrap throws on double-wrapping", () => {
    expect(() => wrap("${{ github.ref }}")).toThrow(
      "Expression already wrapped!",
    );
  });

  test("unwrap extracts inner content", () => {
    const expr: WorkflowExpr = "${{ github.ref }}";
    expect(unwrap(expr)).toBe("github.ref");
  });

  test("unwrap throws on invalid format", () => {
    expect(() => unwrap("github.ref" as WorkflowExpr)).toThrow(
      'Cannot unwrap: expression must start with "${{ " and end with " }}"',
    );
  });

  test("ctx.github provides common properties", () => {
    expect(ctx.github.workflow.toString()).toBe("github.workflow");
    expect(ctx.github.ref.toString()).toBe("github.ref");
    expect(ctx.github.sha.toString()).toBe("github.sha");
    expect(ctx.github.event_name.toString()).toBe("github.event_name");
  });

  test("ctx.env.var creates env tokens", () => {
    const envVar = ctx.env.var("NODE_VERSION");
    expect(envVar.toString()).toBe("env.NODE_VERSION");
  });

  test("ctx.secrets.secret creates secret tokens", () => {
    const secret = ctx.secrets.secret("API_KEY");
    expect(secret.toString()).toBe("secrets.API_KEY");
  });

  test("ctx.matrix.value creates matrix tokens", () => {
    const matrixVal = ctx.matrix.value("os");
    expect(matrixVal.toString()).toBe("matrix.os");
  });

  test("ctx.steps.output creates step output tokens", () => {
    const stepOut = ctx.steps.output("build", "artifact-path");
    expect(stepOut.toString()).toBe("steps.build.outputs.artifact-path");
  });

  test("ctx.needs.output creates job output tokens", () => {
    const jobOut = ctx.needs.output("build", "artifact-path");
    expect(jobOut.toString()).toBe("needs.build.outputs.artifact-path");
  });

  test("ctx.vars.var creates variable tokens", () => {
    const varToken = ctx.vars.var("DEPLOY_ENV");
    expect(varToken.toString()).toBe("vars.DEPLOY_ENV");
  });

  test("fn helpers return expression fragments", () => {
    expect(fn.always()).toBe("always()");
    expect(fn.success()).toBe("success()");
    expect(fn.failure()).toBe("failure()");
    expect(fn.cancelled()).toBe("cancelled()");
  });

  test("fn.contains works", () => {
    const result = fn.contains(ctx.github.ref, "develop");
    expect(result).toBe("contains(github.ref, 'develop')");
  });

  test("fn.startsWith works", () => {
    const result = fn.startsWith(ctx.github.ref, "refs/heads/");
    expect(result).toBe("startsWith(github.ref, 'refs/heads/')");
  });

  test("fn.endsWith works", () => {
    const result = fn.endsWith(ctx.github.head_ref, "-run-tests");
    expect(result).toBe("endsWith(github.head_ref, '-run-tests')");
  });

  test("fn.format works", () => {
    const result = fn.format("PR {0} #{1}", ctx.github.event.pull_request.title, ctx.github.event.pull_request.number);
    expect(result).toContain("format(");
    expect(result).toContain("PR {0} #{1}");
  });

  test("fn.format throws on invalid template", () => {
    expect(() => fn.format("no placeholders", "value")).toThrow(
      "format template must contain placeholders like {0}",
    );
  });

  test("fn.join works", () => {
    const result = fn.join(ctx.matrix.value("os"), ",");
    expect(result).toBe("join(matrix.os, ',')");
  });

  test("fn.hashFiles works", () => {
    const result = fn.hashFiles("package.json", "tsconfig.json");
    expect(result).toBe("hashFiles('package.json', 'tsconfig.json')");
  });

  test("fn.toJSON works", () => {
    const result = fn.toJSON(ctx.github.event);
    expect(result).toBe("toJSON(github.event)");
  });

  test("fn.fromJSON works", () => {
    const result = fn.fromJSON(ctx.github.event.pull_request.title);
    expect(result).toBe("fromJSON(github.event.pull_request.title)");
  });

  test("complex expression example", () => {
    // Note: Using || in JavaScript will evaluate to the first truthy value (head_ref)
    // For expression-level ||, use: expr`${ctx.github.head_ref} || ${ctx.github.ref}`
    const result = expr`${ctx.github.event_name} - ${ctx.github.head_ref || ctx.github.ref}`;
    // JavaScript || evaluates first, so head_ref (truthy Fragment) is used
    expect(result).toBe("${{ github.event_name - github.head_ref }}");
  });

  test("expression-level logical operators", () => {
    // For expression-level ||, put it in the template string
    const result = expr`${ctx.github.head_ref} || ${ctx.github.ref}`;
    expect(result).toBe("${{ github.head_ref || github.ref }}");
  });

  test("expression with function and context", () => {
    const result = expr`${fn.endsWith(ctx.github.head_ref, "-run-tests")} || ${fn.always()}`;
    expect(result).toBe("${{ endsWith(github.head_ref, '-run-tests') || always() }}");
  });
});
