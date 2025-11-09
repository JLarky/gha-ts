import { describe, expect, test, afterEach } from "bun:test";
import { tmpdir } from "os";
import { join } from "path";
import { existsSync, unlinkSync } from "fs";
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { generateWorkflow } from "@jlarky/gha-ts/cli";
import { ctx, expr } from "../src/context";
import { fn } from "../src/context-generated";

describe("event views + expr", () => {
  const tempDir = tmpdir();
  const files: string[] = [];
  const cleanup = () => {
    for (const f of files) if (existsSync(f)) unlinkSync(f);
  };
  afterEach(cleanup);

  test("push: expr with ctx.push.event.ref", async () => {
    const wf = workflow({
      name: "Push Demo",
      on: { push: {} },
      jobs: {
        demo: {
          "runs-on": "ubuntu-latest",
          steps: [
            { name: "push ref", run: `echo ${expr`${ctx.pushEvent.ref}`}` },
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

  test("pull_request: expr with ctx.pr.event.pull_request.number", async () => {
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
              run: `echo ${expr`${ctx.prEvent.number}`}`,
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
