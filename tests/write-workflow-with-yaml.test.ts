import { describe, expect, test } from "bun:test";
import { writeWorkflow, toYamlReadyObject } from "../src/render/yaml";
import { buildWorkflowTriggers } from "../src/examples/workflow-triggers";
import { mkdtempSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { tmpdir } from "os";
import { stringify as yamlStringify, parse as yamlParse } from "yaml";

function makeTempFilePath(fileName: string): string {
  const dir = mkdtempSync(join(tmpdir(), "gha-ts-"));
  return resolve(dir, fileName);
}

describe("writeWorkflow with npm yaml", () => {
  test("writes YAML using external yaml.stringify", () => {
    const workflow = buildWorkflowTriggers();
    const filePath = makeTempFilePath("workflow.generated.yml");

    writeWorkflow(filePath, workflow, (obj) => yamlStringify(obj, { indent: 2 }));

    const content = readFileSync(filePath, "utf8");
    // Header is expected and should be ignored by the parser
    const parsed = yamlParse(content);

    expect(parsed).toEqual(toYamlReadyObject(workflow));
  });
});
