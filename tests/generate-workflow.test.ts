import { describe, expect, test, afterEach } from "bun:test";
import { unlinkSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "@jlarky/gha-ts/actions";
import { generateWorkflow } from "@jlarky/gha-ts/cli";

describe("generateWorkflow() - self-executing pattern", () => {
  const tempDir = tmpdir();
  const testFiles: string[] = [];

  const cleanup = () => {
    for (const file of testFiles) {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    }
  };

  afterEach(cleanup);

  test("generates .generated.yml from .main.ts workflow", async () => {
    const wf = workflow({
      name: "Test Workflow",
      on: {
        push: { branches: ["main"] },
        pull_request: {},
      },
      jobs: {
        test: {
          "runs-on": "ubuntu-latest",
          steps: [
            checkout({ "fetch-depth": 0 }),
            { name: "Test", run: "echo 'Hello, world!'" },
          ],
        },
      },
    });

    // Simulate import.meta.url for a file like .github/workflows/example.main.ts
    const simulatedModuleUrl = `file://${join(tempDir, "example.main.ts")}`;
    const expectedOutFile = join(tempDir, "example.generated.yml");

    testFiles.push(expectedOutFile);

    await generateWorkflow(wf, YAML.stringify, simulatedModuleUrl);

    expect(existsSync(expectedOutFile)).toBe(true);

    const content = await Bun.file(expectedOutFile).text();
    expect(content).toContain("name: Test Workflow");
    expect(content).toContain("push:");
    expect(content).toContain("pull_request:");
    expect(content).toContain("runs-on: ubuntu-latest");
    expect(content).toContain("actions/checkout");
  });

  test("handles .main.ts suffix correctly", async () => {
    const wf = workflow({
      name: "Minimal",
      on: { push: {} },
      jobs: {
        job: { "runs-on": "ubuntu-latest", steps: [{ run: "echo test" }] },
      },
    });

    const simulatedModuleUrl = `file://${join(tempDir, "publish.main.ts")}`;
    const expectedOutFile = join(tempDir, "publish.generated.yml");

    testFiles.push(expectedOutFile);

    await generateWorkflow(wf, YAML.stringify, simulatedModuleUrl);

    expect(existsSync(expectedOutFile)).toBe(true);
    expect(expectedOutFile).toContain("publish.generated.yml");
  });

  test("preserves workflow structure in generated file", async () => {
    const wf = workflow({
      name: "Structure Test",
      on: { push: {} },
      permissions: {
        contents: "read",
        "id-token": "write",
      },
      jobs: {
        build: {
          "runs-on": "ubuntu-latest",
          steps: [{ run: "npm run build" }],
        },
      },
    });

    const simulatedModuleUrl = `file://${join(tempDir, "structure.main.ts")}`;
    const expectedOutFile = join(tempDir, "structure.generated.yml");

    testFiles.push(expectedOutFile);

    await generateWorkflow(wf, YAML.stringify, simulatedModuleUrl);

    const yaml = await Bun.file(expectedOutFile).text();

    // Check header
    expect(yaml).toContain("# Do not modify!");
    expect(yaml).toContain("https://github.com/JLarky/gha-ts");

    // Check workflow name
    expect(yaml).toContain("name: Structure Test");

    // Check permissions
    expect(yaml).toContain("contents: read");
    expect(yaml).toContain("id-token: write");

    // Check job structure
    expect(yaml).toContain("build:");
    expect(yaml).toContain("npm run build");
  });
});
