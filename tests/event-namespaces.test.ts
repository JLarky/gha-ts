import { describe, expect, test, afterEach } from "bun:test";
import { tmpdir } from "os";
import { join } from "path";
import { existsSync, unlinkSync } from "fs";
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { generateWorkflow } from "@jlarky/gha-ts/cli";
import { ctx, expr, pr, push } from "../src/context";
import { fn } from "../src/context-generated";

describe("event namespaces + scoped expr", () => {
  const tempDir = tmpdir();
  const files: string[] = [];
  const cleanup = () => {
    for (const f of files) if (existsSync(f)) unlinkSync(f);
  };
  afterEach(cleanup);

  test("push: ctx.events.push.ref and push.expr with ctx.push.ref", async () => {
    const wf = workflow({
      name: "Push Demo",
      on: { push: {} },
      jobs: {
        demo: {
          "runs-on": "ubuntu-latest",
          steps: [
            {
              name: "events.push",
              run: `echo ${expr`${ctx.events.push.ref}`}`,
            },
            {
              name: "push.expr",
              run: `echo ${push.expr`${ctx.push.ref}`}`,
            },
          ],
        },
      },
    });
    const modUrl = `file://${join(tempDir, "push-demo.main.ts")}`;
    const out = join(tempDir, "push-demo.generated.yml");
    files.push(out);
    await generateWorkflow(wf, YAML.stringify, modUrl);
    const y = await Bun.file(out).text();
    expect(y).toContain("${{ github.event.ref }}");
  });

  test("pull_request: pr.expr with ctx.pull_request.number", async () => {
    const wf = workflow({
      name: "PR Demo",
      on: { pull_request: {} },
      jobs: {
        demo: {
          "runs-on": "ubuntu-latest",
          steps: [
            {
              name: "pr number",
              if: expr`${fn.contains(ctx.github.event_name, "pull_request")}`,
              run: `echo ${pr.expr`${ctx.pull_request.number}`}`,
            },
          ],
        },
      },
    });
    const modUrl = `file://${join(tempDir, "pr-demo.main.ts")}`;
    const out = join(tempDir, "pr-demo.generated.yml");
    files.push(out);
    await generateWorkflow(wf, YAML.stringify, modUrl);
    const y = await Bun.file(out).text();
    expect(y).toContain("${{ github.event.pull_request.number }}");
  });
});
