import { describe, expect, test, afterEach } from "bun:test";
import { tmpdir } from "os";
import { join } from "path";
import { existsSync, unlinkSync } from "fs";
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { generateWorkflow } from "@jlarky/gha-ts/cli";
import { ctx, expr } from "../src/context";
import { fn } from "../src/context-generated";

describe("ctx + fn integration", () => {
  const tempDir = tmpdir();
  const files: string[] = [];
  const cleanup = () => {
    for (const f of files) if (existsSync(f)) unlinkSync(f);
  };
  afterEach(cleanup);

  test("renders expressions with ctx and fn into YAML", async () => {
    const wf = workflow({
      name: "Expr Demo",
      on: { push: {} },
      jobs: {
        demo: {
          "runs-on": "ubuntu-latest",
          steps: [
            { name: "ref", run: `echo ${expr`${ctx.github.ref}`}` },
            {
              name: "startsWith",
              if: expr`${fn.startsWith(ctx.github.ref, "refs/heads/main")}`,
              run: "echo main",
            },
            {
              name: "format",
              run: `echo ${expr`${fn.format("Run {0}", ctx.github.run_id)}`}`,
            },
          ],
        },
      },
    });

    const modUrl = `file://${join(tempDir, "expr-demo.main.ts")}`;
    const out = join(tempDir, "expr-demo.generated.yml");
    files.push(out);

    await generateWorkflow(wf, YAML.stringify, modUrl);

    const content = await Bun.file(out).text();
    expect(content).toContain("${{ github.ref }}");
    expect(content).toContain("${{ startsWith(github.ref, 'refs/heads/main') }}");
    expect(content).toContain("${{ format('Run {0}', github.run_id) }}");
  });
});

