import type { Stringify } from "../src/render/index";

// npm:yaml implementation (using the yaml package)
export function createNpmYamlStringify(): Stringify {
  // Dynamic import to avoid issues if yaml package is not available
  const { stringify } = require("yaml");
  return (
    input: unknown,
    replacer?: undefined | null,
    space?: string | number,
  ) => {
    return stringify(input, replacer, space);
  };
}

// bun:yaml implementation (using Bun's built-in YAML)
export function createBunYamlStringify(): Stringify {
  return (
    input: unknown,
    replacer?: undefined | null,
    space?: string | number,
  ) => {
    // @ts-ignore - Bun's YAML is not typed
    return Bun.YAML.stringify(input, replacer, space);
  };
}

// Helper to create a renderWorkflowYaml-like function for backward compatibility in tests
export function createRenderWorkflowYaml(stringify: Stringify) {
  const { createSerializer } = require("../src/render/index");
  const { HEADER } = require("../src/render/yaml");

  return function renderWorkflowYaml(
    workflow: any,
    options?: { header?: string },
  ): string {
    return createSerializer(workflow, stringify)
      .setHeader(options?.header ?? HEADER)
      .stringifyWorkflow();
  };
}
