import { describe, expect, test } from "bun:test";
import {
  createNpmYamlStringify,
  createBunYamlStringify,
  createRenderWorkflowYaml,
} from "./yaml-implementations";
import {
  Workflow,
  workflow,
  job,
  run,
  uses,
  validateWorkflow,
} from "../src/workflow-types";

// Test both implementations
const implementations = [
  {
    name: "npm:yaml",
    renderWorkflowYaml: createRenderWorkflowYaml(createNpmYamlStringify()),
  },
  {
    name: "bun:yaml",
    renderWorkflowYaml: createRenderWorkflowYaml(createBunYamlStringify()),
  },
];

describe("validation", () => {
  implementations.forEach(({ name, renderWorkflowYaml }) => {
    test(`throws when step has both run and uses (${name})`, () => {
      const wf: Workflow = workflow({
        name: "invalid",
        on: ["push"],
        jobs: {
          j: job({
            "runs-on": "ubuntu-latest",
            steps: [
              // @ts-expect-error intentionally invalid
              { run: "echo hi", uses: "actions/checkout@v4" },
            ],
          }),
        },
      });
      expect(() => renderWorkflowYaml(wf)).toThrow(
        /cannot have both run and uses/,
      );
    });

    test(`throws when step has neither run nor uses (${name})`, () => {
      const wf: Workflow = workflow({
        name: "invalid2",
        on: ["push"],
        jobs: {
          j: job({
            "runs-on": "ubuntu-latest",
            steps: [
              // @ts-expect-error intentionally invalid
              { name: "noop" },
            ],
          }),
        },
      });
      expect(() => validateWorkflow(wf)).toThrow(/must have run or uses/);
    });

    test(`throws when on object has no triggers set (${name})`, () => {
      const wf: Workflow = workflow({
        name: "invalid3",
        on: {},
        jobs: {
          j: job({ "runs-on": "ubuntu-latest", steps: [run("echo")] }),
        },
      });
      expect(() => validateWorkflow(wf)).toThrow(/at least one trigger/);
    });
  });
});
