import { describe, expect, test } from "bun:test";
import YAML from "yaml";

import { createSerializer } from "@jlarky/gha-ts/render";
import { toYamlReadyObject } from "../src/render/yaml";
import { wf as workflowTriggersWf } from "../examples/workflow-triggers";
import { wf as prebuildActionsWf } from "../examples/prebuild-actions";

describe("YAML stringify compatibility and JSON conversion", () => {
  test("Bun.YAML.stringify round-trips to canonical object (workflow-triggers)", () => {
    const canonical = toYamlReadyObject(workflowTriggersWf);
    const yaml = createSerializer(
      workflowTriggersWf,
      Bun.YAML.stringify,
    ).stringifyWorkflow();
    const parsed = YAML.parse(yaml);
    expect(parsed).toEqual(canonical);
  });

  test("npm yaml.stringify round-trips to canonical object (workflow-triggers)", () => {
    const canonical = toYamlReadyObject(workflowTriggersWf);
    const yaml = createSerializer(
      workflowTriggersWf,
      YAML.stringify,
    ).stringifyWorkflow();
    const parsed = YAML.parse(yaml);
    expect(parsed).toEqual(canonical);
  });

  test("Bun.YAML.stringify round-trips to canonical object (prebuild-actions)", () => {
    const canonical = toYamlReadyObject(prebuildActionsWf);
    const yaml = createSerializer(
      prebuildActionsWf,
      Bun.YAML.stringify,
    ).stringifyWorkflow();
    const parsed = YAML.parse(yaml);
    expect(parsed).toEqual(canonical);
  });

  test("npm yaml.stringify round-trips to canonical object (prebuild-actions)", () => {
    const canonical = toYamlReadyObject(prebuildActionsWf);
    const yaml = createSerializer(
      prebuildActionsWf,
      YAML.stringify,
    ).stringifyWorkflow();
    const parsed = YAML.parse(yaml);
    expect(parsed).toEqual(canonical);
  });
});
