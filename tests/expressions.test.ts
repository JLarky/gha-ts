import { describe, test, expect } from "bun:test";
import {
  expr,
  ctx,
  fn,
  wrap,
  unwrap,
  fragment,
  token,
  raw,
  type WorkflowExpr,
  type Fragment,
} from "../src/expressions";

describe("expressions", () => {
  describe("wrap and unwrap", () => {
    test("wrap adds expression wrapper", () => {
      expect(wrap("github.ref")).toBe("${{ github.ref }}");
    });

    test("wrap trims whitespace", () => {
      expect(wrap("  github.ref  ")).toBe("${{ github.ref }}");
    });

    test("wrap throws on double-wrapping", () => {
      expect(() => wrap("${{ github.ref }}")).toThrow(
        "Expression already wrapped",
      );
    });

    test("unwrap removes expression wrapper", () => {
      const expr: WorkflowExpr = "${{ github.ref }}";
      expect(unwrap(expr)).toBe("github.ref");
    });

    test("unwrap throws on invalid format", () => {
      expect(() => unwrap("github.ref" as WorkflowExpr)).toThrow(
        "Cannot unwrap",
      );
    });
  });

  describe("fragment and token", () => {
    test("fragment creates Fragment object", () => {
      const frag = fragment("github.ref");
      expect(frag.inner).toBe("github.ref");
      expect(frag.toString()).toBe("github.ref");
      expect(frag.wrap()).toBe("${{ github.ref }}");
    });

    test("token creates token Fragment", () => {
      const tok = token("github.ref");
      expect(tok.inner).toBe("github.ref");
    });
  });

  describe("raw", () => {
    test("raw quotes strings", () => {
      const r = raw("hello");
      expect(r.inner).toBe("'hello'");
    });

    test("raw escapes single quotes", () => {
      const r = raw("it's");
      expect(r.inner).toBe("'it'\\''s'");
    });
  });

  describe("expr tagged template", () => {
    test("simple context access", () => {
      const result = expr`${ctx.github.ref}`;
      expect(result).toBe("${{ github.ref }}");
    });

    test("multiple context values", () => {
      const result = expr`${ctx.github.workflow} - ${ctx.github.ref}`;
      expect(result).toBe("${{ github.workflow - github.ref }}");
    });

    test("with string literals (auto-quoted)", () => {
      const result = expr`${ctx.github.event_name} == ${"push"}`;
      expect(result).toBe("${{ github.event_name == 'push' }}");
    });

    test("with numbers (not quoted)", () => {
      const result = expr`${ctx.github.run_number} > ${100}`;
      expect(result).toBe("${{ github.run_number > 100 }}");
    });

    test("with booleans (not quoted)", () => {
      const result = expr`${true}`;
      expect(result).toBe("${{ true }}");
    });

    test("with logical operators", () => {
      const result = expr`${ctx.github.event_name} == 'push' || ${ctx.github.event_name} == 'pull_request'`;
      expect(result).toBe(
        "${{ github.event_name == 'push' || github.event_name == 'pull_request' }}",
      );
    });

    test("with fallback (||)", () => {
      const result = expr`${ctx.github.head_ref || ctx.github.ref}`;
      expect(result).toBe("${{ github.head_ref || github.ref }}");
    });
  });

  describe("fn helpers", () => {
    test("fn.always()", () => {
      const result = expr`${fn.always()}`;
      expect(result).toBe("${{ always() }}");
    });

    test("fn.success()", () => {
      const result = expr`${fn.success()}`;
      expect(result).toBe("${{ success() }}");
    });

    test("fn.failure()", () => {
      const result = expr`${fn.failure()}`;
      expect(result).toBe("${{ failure() }}");
    });

    test("fn.cancelled()", () => {
      const result = expr`${fn.cancelled()}`;
      expect(result).toBe("${{ cancelled() }}");
    });

    test("fn.contains with context values", () => {
      const result = expr`${fn.contains(ctx.github.ref, "main")}`;
      expect(result).toBe("${{ contains(github.ref, 'main') }}");
    });

    test("fn.contains with auto-quoted string", () => {
      const result = expr`${fn.contains("hello world", "world")}`;
      expect(result).toBe("${{ contains('hello world', 'world') }}");
    });

    test("fn.startsWith", () => {
      const result = expr`${fn.startsWith(ctx.github.ref, "refs/heads/")}`;
      expect(result).toBe("${{ startsWith(github.ref, 'refs/heads/') }}");
    });

    test("fn.endsWith", () => {
      const result = expr`${fn.endsWith(ctx.github.head_ref, "-run-tests")}`;
      expect(result).toBe(
        "${{ endsWith(github.head_ref, '-run-tests') }}",
      );
    });

    test("fn.format with placeholders", () => {
      const result = expr`${fn.format("PR {0} #{1}", ctx.github.event.pull_request.title, ctx.github.event.pull_request.number)}`;
      expect(result).toBe(
        "${{ format('PR {0} #{1}', github.event.pull_request.title, github.event.pull_request.number) }}",
      );
    });

    test("fn.format throws without placeholders", () => {
      expect(() => fn.format("no placeholders")).toThrow(
        "format template must contain placeholders",
      );
    });

    test("fn.join with default separator", () => {
      const result = expr`${fn.join(ctx.matrix.value("os"))}`;
      expect(result).toBe("${{ join(matrix.os, ',') }}");
    });

    test("fn.join with custom separator", () => {
      const result = expr`${fn.join(ctx.matrix.value("os"), " | ")}`;
      expect(result).toBe("${{ join(matrix.os, ' | ') }}");
    });

    test("fn.hashFiles with multiple paths", () => {
      const result = expr`${fn.hashFiles("package.json", "bun.lock")}`;
      expect(result).toBe(
        "${{ hashFiles('package.json', 'bun.lock') }}",
      );
    });

    test("fn.toJSON", () => {
      const result = expr`${fn.toJSON(ctx.matrix.value("config"))}`;
      expect(result).toBe("${{ toJSON(matrix.config) }}");
    });

    test("fn.fromJSON", () => {
      const result = expr`${fn.fromJSON(ctx.needs.output("build", "metadata"))}`;
      expect(result).toBe(
        "${{ fromJSON(needs.build.outputs.metadata) }}",
      );
    });
  });

  describe("ctx.github", () => {
    test("basic properties", () => {
      expect(expr`${ctx.github.workflow}`).toBe("${{ github.workflow }}");
      expect(expr`${ctx.github.ref}`).toBe("${{ github.ref }}");
      expect(expr`${ctx.github.sha}`).toBe("${{ github.sha }}");
      expect(expr`${ctx.github.event_name}`).toBe("${{ github.event_name }}");
      expect(expr`${ctx.github.head_ref}`).toBe("${{ github.head_ref }}");
      expect(expr`${ctx.github.base_ref}`).toBe("${{ github.base_ref }}");
      expect(expr`${ctx.github.repository}`).toBe("${{ github.repository }}");
      expect(expr`${ctx.github.repository_owner}`).toBe(
        "${{ github.repository_owner }}",
      );
      expect(expr`${ctx.github.actor}`).toBe("${{ github.actor }}");
    });

    test("event.pull_request", () => {
      expect(expr`${ctx.github.event.pull_request.title}`).toBe(
        "${{ github.event.pull_request.title }}",
      );
      expect(expr`${ctx.github.event.pull_request.number}`).toBe(
        "${{ github.event.pull_request.number }}",
      );
      expect(expr`${ctx.github.event.pull_request.head.ref}`).toBe(
        "${{ github.event.pull_request.head.ref }}",
      );
      expect(expr`${ctx.github.event.pull_request.base.sha}`).toBe(
        "${{ github.event.pull_request.base.sha }}",
      );
    });

    test("event.merge_group", () => {
      expect(expr`${ctx.github.event.merge_group.head_ref}`).toBe(
        "${{ github.event.merge_group.head_ref }}",
      );
      expect(expr`${ctx.github.event.merge_group.base_sha}`).toBe(
        "${{ github.event.merge_group.base_sha }}",
      );
    });

    test("eventPath custom accessor", () => {
      expect(expr`${ctx.github.eventPath("issue.number")}`).toBe(
        "${{ github.event.issue.number }}",
      );
    });
  });

  describe("ctx.env", () => {
    test("var()", () => {
      expect(expr`${ctx.env.var("NODE_VERSION")}`).toBe(
        "${{ env.NODE_VERSION }}",
      );
      expect(expr`${ctx.env.var("CI")}`).toBe("${{ env.CI }}");
    });
  });

  describe("ctx.secrets", () => {
    test("secret()", () => {
      expect(expr`${ctx.secrets.secret("API_KEY")}`).toBe(
        "${{ secrets.API_KEY }}",
      );
      expect(expr`${ctx.secrets.secret("GITHUB_TOKEN")}`).toBe(
        "${{ secrets.GITHUB_TOKEN }}",
      );
    });
  });

  describe("ctx.matrix", () => {
    test("value()", () => {
      expect(expr`${ctx.matrix.value("os")}`).toBe("${{ matrix.os }}");
      expect(expr`${ctx.matrix.value("node-version")}`).toBe(
        "${{ matrix.node-version }}",
      );
    });
  });

  describe("ctx.steps", () => {
    test("output()", () => {
      expect(expr`${ctx.steps.output("build", "artifact-path")}`).toBe(
        "${{ steps.build.outputs.artifact-path }}",
      );
    });

    test("conclusion()", () => {
      expect(expr`${ctx.steps.conclusion("test")}`).toBe(
        "${{ steps.test.conclusion }}",
      );
    });

    test("outcome()", () => {
      expect(expr`${ctx.steps.outcome("test")}`).toBe(
        "${{ steps.test.outcome }}",
      );
    });
  });

  describe("ctx.needs", () => {
    test("output()", () => {
      expect(expr`${ctx.needs.output("build", "version")}`).toBe(
        "${{ needs.build.outputs.version }}",
      );
    });

    test("result()", () => {
      expect(expr`${ctx.needs.result("test")}`).toBe(
        "${{ needs.test.result }}",
      );
    });
  });

  describe("ctx.inputs", () => {
    test("get()", () => {
      expect(expr`${ctx.inputs.get("environment")}`).toBe(
        "${{ inputs.environment }}",
      );
    });
  });

  describe("ctx.vars", () => {
    test("get()", () => {
      expect(expr`${ctx.vars.get("DEPLOY_REGION")}`).toBe(
        "${{ vars.DEPLOY_REGION }}",
      );
    });
  });

  describe("ctx.runner", () => {
    test("properties", () => {
      expect(expr`${ctx.runner.os}`).toBe("${{ runner.os }}");
      expect(expr`${ctx.runner.arch}`).toBe("${{ runner.arch }}");
      expect(expr`${ctx.runner.name}`).toBe("${{ runner.name }}");
      expect(expr`${ctx.runner.temp}`).toBe("${{ runner.temp }}");
      expect(expr`${ctx.runner.tool_cache}`).toBe(
        "${{ runner.tool_cache }}",
      );
    });
  });

  describe("ctx.job", () => {
    test("status", () => {
      expect(expr`${ctx.job.status}`).toBe("${{ job.status }}");
    });

    test("container", () => {
      expect(expr`${ctx.job.container.id}`).toBe(
        "${{ job.container.id }}",
      );
      expect(expr`${ctx.job.container.network}`).toBe(
        "${{ job.container.network }}",
      );
    });

    test("service()", () => {
      expect(expr`${ctx.job.service("redis", "id")}`).toBe(
        "${{ job.services.redis.id }}",
      );
    });
  });

  describe("ctx.strategy", () => {
    test("properties", () => {
      expect(expr`${ctx.strategy.fail_fast}`).toBe(
        "${{ strategy.fail-fast }}",
      );
      expect(expr`${ctx.strategy.job_index}`).toBe(
        "${{ strategy.job-index }}",
      );
      expect(expr`${ctx.strategy.job_total}`).toBe(
        "${{ strategy.job-total }}",
      );
      expect(expr`${ctx.strategy.max_parallel}`).toBe(
        "${{ strategy.max-parallel }}",
      );
    });
  });

  describe("ctx.token()", () => {
    test("custom token", () => {
      expect(expr`${ctx.token("github.custom")}`).toBe(
        "${{ github.custom }}",
      );
    });
  });

  describe("complex real-world examples", () => {
    test("run-name with fallback", () => {
      const result = expr`${ctx.github.event_name} - ${ctx.github.head_ref || ctx.github.ref}`;
      expect(result).toBe(
        "${{ github.event_name - github.head_ref || github.ref }}",
      );
    });

    test("concurrency group", () => {
      const result = expr`${ctx.github.workflow} - ${ctx.github.ref}`;
      expect(result).toBe("${{ github.workflow - github.ref }}");
    });

    test("conditional with function", () => {
      const result = expr`${ctx.github.event_name} == 'merge_group' || ${fn.endsWith(ctx.github.head_ref, "-run-tests")}`;
      expect(result).toBe(
        "${{ github.event_name == 'merge_group' || endsWith(github.head_ref, '-run-tests') }}",
      );
    });

    test("cache key with hashFiles", () => {
      const result = expr`${ctx.runner.os}-node-${fn.hashFiles("package.json", "bun.lock")}`;
      expect(result).toBe(
        "${{ runner.os-node-hashFiles('package.json', 'bun.lock') }}",
      );
    });

    test("format PR title", () => {
      const result = expr`${fn.format("PR {0} #{1}", ctx.github.event.pull_request.title, ctx.github.event.pull_request.number)}`;
      expect(result).toBe(
        "${{ format('PR {0} #{1}', github.event.pull_request.title, github.event.pull_request.number) }}",
      );
    });

    test("conditional on steps output", () => {
      const result = expr`${fn.success()} && ${ctx.steps.output("test", "coverage")} > 80`;
      expect(result).toBe(
        "${{ success() && steps.test.outputs.coverage > 80 }}",
      );
    });

    test("needs output with fromJSON", () => {
      const result = expr`${fn.fromJSON(ctx.needs.output("build", "matrix"))}`;
      expect(result).toBe(
        "${{ fromJSON(needs.build.outputs.matrix) }}",
      );
    });
  });

  describe("edge cases and validation", () => {
    test("escapes quotes in plain strings", () => {
      const result = expr`${"it's a test"}`;
      expect(result).toBe("${{ 'it'\\''s a test' }}");
    });

    test("raw() for explicit control", () => {
      const result = expr`${ctx.raw("complex'string")}`;
      expect(result).toBe("${{ 'complex'\\''string' }}");
    });

    test("undefined values are skipped", () => {
      const result = expr`${ctx.github.ref}${undefined}`;
      expect(result).toBe("${{ github.ref }}");
    });

    test("Fragment can be reused", () => {
      const ref = ctx.github.ref;
      expect(expr`${ref}`).toBe("${{ github.ref }}");
      expect(expr`${ref}`).toBe("${{ github.ref }}");
    });

    test("intentional unwrap and rewrap", () => {
      const expr1 = expr`${ctx.github.ref}`;
      const inner = unwrap(expr1);
      const expr2 = expr`${inner}`;
      expect(expr2).toBe("${{ github.ref }}");
    });
  });
});
