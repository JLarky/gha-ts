import { describe, expect, test } from "bun:test";
import { createSerializer } from "@jlarky/gha-ts/render";
import { workflow, job, run, Workflow } from "@jlarky/gha-ts/workflow-types";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { fileURLToPath } from "url";
import { YAML } from "bun";

describe("ordering and formatting", () => {
  test("top-level key order and trailing newline", () => {
    const wf: Workflow = workflow({
      name: "order test",
      on: ["push"],
      env: { A: "1" },
      concurrency: { group: "g", "cancel-in-progress": true },
      permissions: { contents: "read" },
      jobs: { j: job({ "runs-on": "ubuntu-latest", steps: [run(":")] }) },
    });
    const yaml = createSerializer(wf, Bun.YAML.stringify).stringifyWorkflow();
    expect(yaml.endsWith("\n")).toBe(true);
    const lines = yaml.split("\n");
    const idx = (prefix: string) =>
      lines.findIndex((l) => l.startsWith(prefix));
    const iName = idx("name:");
    const iOn = idx('"on": ');
    const iEnv = idx("env:");
    const iConc = idx("concurrency:");
    const iPerm = idx("permissions:");
    const iJobs = idx("jobs: ");
    expect(iName).toBeGreaterThanOrEqual(0);
    expect(iName).toBeLessThan(iOn);
    expect(iOn).toBeLessThan(iEnv);
    expect(iEnv).toBeLessThan(iConc);
    expect(iConc).toBeLessThan(iPerm);
    expect(iPerm).toBeLessThan(iJobs);
  });
});

describe("permissions and concurrency", () => {
  test("renders permissions map and concurrency object", () => {
    const wf: Workflow = workflow({
      name: "perm conc",
      on: ["push"],
      permissions: { contents: "read", actions: "write" },
      concurrency: { group: "deploy", "cancel-in-progress": false },
      jobs: { j: job({ "runs-on": "ubuntu-latest", steps: [run(":")] }) },
    });
    const yaml = createSerializer(wf, Bun.YAML.stringify).stringifyWorkflow();
    expect(yaml).toContain("permissions:");
    expect(yaml).toContain("contents: read");
    expect(yaml).toContain("actions: write");
    expect(yaml).toContain("concurrency:");
    expect(yaml).toContain("group: deploy");
    expect(yaml).toContain("cancel-in-progress: false");
  });

  test("renders read-all permissions and string concurrency", () => {
    const wf: Workflow = workflow({
      name: "perm conc 2",
      on: ["push"],
      permissions: "read-all",
      concurrency: "my-group",
      jobs: { j: job({ "runs-on": "ubuntu-latest", steps: [run(":")] }) },
    });
    const yaml = createSerializer(wf, Bun.YAML.stringify).stringifyWorkflow();
    expect(yaml).toContain("permissions: read-all");
    expect(yaml).toContain("concurrency: my-group");
  });
});

describe("CLI generate smoke", () => {
  test("writes workflows into .github/workflows under cwd", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "gha-ts-cli-"));
    try {
      const cliPath = fileURLToPath(
        new URL("./generate-cli.ts", import.meta.url),
      );
      const proc = Bun.spawn({
        cmd: ["bun", cliPath],
        cwd: tmp,
        stdout: "pipe",
        stderr: "pipe",
      });
      const exitCode = await proc.exited;
      expect(exitCode).toBe(0);
      const outDir = join(tmp, ".github", "workflows");
      const a = join(outDir, "workflow-triggers.generated.yml");
      const b = join(outDir, "prebuild-actions.generated.yml");
      expect(existsSync(a)).toBe(true);
      expect(existsSync(b)).toBe(true);
      const aContent = readFileSync(a, "utf8");
      const bContent = readFileSync(b, "utf8");
      expect(aContent.startsWith("# Do not modify!\n")).toBe(true);
      expect(bContent.startsWith("# Do not modify!\n")).toBe(true);
      // Ensure YAML parses
      expect(() => YAML.parse(aContent)).not.toThrow();
      expect(() => YAML.parse(bContent)).not.toThrow();
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
