import { describe, expect, test } from "bun:test";
import YAML from "yaml";
import * as jsYaml from "js-yaml";

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

  test("js-yaml.dump round-trips to canonical object (workflow-triggers)", () => {
    const canonical = toYamlReadyObject(workflowTriggersWf);
    const yaml = createSerializer(workflowTriggersWf, (input) =>
      jsYaml.dump(input, { noRefs: true }),
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

  test("js-yaml.dump round-trips to canonical object (prebuild-actions)", () => {
    const canonical = toYamlReadyObject(prebuildActionsWf);
    const yaml = createSerializer(prebuildActionsWf, (input) =>
      jsYaml.dump(input, { noRefs: true }),
    ).stringifyWorkflow();
    const parsed = YAML.parse(yaml);
    expect(parsed).toEqual(canonical);
  });
});

describe("yaml roundtrip for regex", () => {
  const regex =
    "^(?:\\x1b\\[\\d+m)?(.+?)(?:\\x1b\\[\\d+m)*:(?:\\x1b\\[\\d+m)*(\\d+)(?:\\x1b\\[\\d+m)*:(?:\\x1b\\[\\d+m)*(\\d+)(?:\\x1b\\[\\d+m)*: (?:\\x1b\\[\\d+m)*(.+?)(?:\\x1b\\[\\d+m)* \\[(.+?)\\]$";

  test("yaml module produces 4 lines of output", () => {
    const yaml = YAML.stringify({ regex });
    expect(yaml).toMatchInlineSnapshot(`
        "regex: "^(?:\\\\x1b\\\\[\\\\d+m)?(.+?)(?:\\\\x1b\\\\[\\\\d+m)*:(?:\\\\x1b\\\\[\\\\d+m)*(\\\\d+)(?:\\
          \\\\x1b\\\\[\\\\d+m)*:(?:\\\\x1b\\\\[\\\\d+m)*(\\\\d+)(?:\\\\x1b\\\\[\\\\d+m)*:
          (?:\\\\x1b\\\\[\\\\d+m)*(.+?)(?:\\\\x1b\\\\[\\\\d+m)* \\\\[(.+?)\\\\]$"
        "
      `);
    expect(yaml.split("\n").length).toBe(4);
    expect(Bun.YAML.parse(yaml)).toEqual({ regex });
    expect(YAML.parse(yaml)).toEqual({ regex });
    expect(jsYaml.load(yaml)).toEqual({ regex });
  });

  test("js-yaml module produces 4 lines of output", () => {
    const yaml = jsYaml.dump({ regex });
    expect(yaml).toMatchInlineSnapshot(`
      "regex: >-
        ^(?:\\x1b\\[\\d+m)?(.+?)(?:\\x1b\\[\\d+m)*:(?:\\x1b\\[\\d+m)*(\\d+)(?:\\x1b\\[\\d+m)*:(?:\\x1b\\[\\d+m)*(\\d+)(?:\\x1b\\[\\d+m)*:
        (?:\\x1b\\[\\d+m)*(.+?)(?:\\x1b\\[\\d+m)* \\[(.+?)\\]$
      "
    `);
    expect(yaml.split("\n").length).toBe(4);
    expect(Bun.YAML.parse(yaml)).toEqual({ regex });
    expect(YAML.parse(yaml)).toEqual({ regex });
    expect(jsYaml.load(yaml)).toEqual({ regex });
  });

  test("js-yaml module produces 2 lines of output when lineWidth is bigger", () => {
    const yaml = jsYaml.dump({ regex }, { lineWidth: Infinity });
    expect(yaml).toMatchInlineSnapshot(`
      "regex: '^(?:\\x1b\\[\\d+m)?(.+?)(?:\\x1b\\[\\d+m)*:(?:\\x1b\\[\\d+m)*(\\d+)(?:\\x1b\\[\\d+m)*:(?:\\x1b\\[\\d+m)*(\\d+)(?:\\x1b\\[\\d+m)*: (?:\\x1b\\[\\d+m)*(.+?)(?:\\x1b\\[\\d+m)* \\[(.+?)\\]$'
      "
    `);
    expect(yaml.split("\n").length).toBe(2);
    expect(Bun.YAML.parse(yaml)).toEqual({ regex });
    expect(YAML.parse(yaml)).toEqual({ regex });
    expect(jsYaml.load(yaml)).toEqual({ regex });
  });

  test("Bun.YAML module produces no newlines in the output", () => {
    const yaml = Bun.YAML.stringify({ regex });
    expect(yaml).toMatchInlineSnapshot(
      `"{regex: "^(?:\\\\x1b\\\\[\\\\d+m)?(.+?)(?:\\\\x1b\\\\[\\\\d+m)*:(?:\\\\x1b\\\\[\\\\d+m)*(\\\\d+)(?:\\\\x1b\\\\[\\\\d+m)*:(?:\\\\x1b\\\\[\\\\d+m)*(\\\\d+)(?:\\\\x1b\\\\[\\\\d+m)*: (?:\\\\x1b\\\\[\\\\d+m)*(.+?)(?:\\\\x1b\\\\[\\\\d+m)* \\\\[(.+?)\\\\]$"}"`,
    );
    expect(yaml.split("\n").length).toBe(1);
    expect(Bun.YAML.parse(yaml)).toEqual({ regex });
    expect(YAML.parse(yaml)).toEqual({ regex });
    expect(jsYaml.load(yaml)).toEqual({ regex });
  });
});
