import { describe, expect, test } from "bun:test";
import { createSerializer } from "@jlarky/gha-ts/render";
import {
  Workflow,
  workflow,
  job,
  run,
  validateWorkflow,
} from "@jlarky/gha-ts/workflow-types";

describe("validation", () => {
  test("throws when step has both run and uses", () => {
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
    expect(() => createSerializer(wf).stringifyWorkflow()).toThrow(
      /cannot have both run and uses/,
    );
  });

  test("throws when step has neither run nor uses", () => {
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

  test("throws when on object has no triggers set", () => {
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
