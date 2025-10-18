import { describe, expect, test } from "bun:test";
import YAML from "yaml";

import { createSerializer } from "../src/render";
import { toYamlReadyObject } from "../src/render/yaml";
import { buildWorkflowTriggers } from "../examples/workflow-triggers";
import { buildPrebuildActions } from "../examples/prebuild-actions";

describe("YAML stringify compatibility and JSON conversion", () => {
  test("Bun.YAML.stringify round-trips to canonical object (workflow-triggers)", () => {
    const wf = buildWorkflowTriggers();
    const canonical = toYamlReadyObject(wf);
    const yaml = createSerializer(wf, Bun.YAML.stringify).stringifyWorkflow();
    const parsed = YAML.parse(yaml);
    expect(parsed).toEqual(canonical);
  });

  test("npm yaml.stringify round-trips to canonical object (workflow-triggers)", () => {
    const wf = buildWorkflowTriggers();
    const canonical = toYamlReadyObject(wf);
    const yaml = createSerializer(wf, YAML.stringify).stringifyWorkflow();
    const parsed = YAML.parse(yaml);
    expect(parsed).toEqual(canonical);
  });

  test("Bun.YAML.stringify round-trips to canonical object (prebuild-actions)", () => {
    const wf = buildPrebuildActions();
    const canonical = toYamlReadyObject(wf);
    const yaml = createSerializer(wf, Bun.YAML.stringify).stringifyWorkflow();
    const parsed = YAML.parse(yaml);
    expect(parsed).toEqual(canonical);
  });

  test("npm yaml.stringify round-trips to canonical object (prebuild-actions)", () => {
    const wf = buildPrebuildActions();
    const canonical = toYamlReadyObject(wf);
    const yaml = createSerializer(wf, YAML.stringify).stringifyWorkflow();
    const parsed = YAML.parse(yaml);
    expect(parsed).toEqual(canonical);
  });
});
