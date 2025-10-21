import { describe, expect, test } from "bun:test";
import { createSerializer } from "@jlarky/gha-ts/render";
import { workflow } from "@jlarky/gha-ts/workflow-types";

describe("multiline run uses YAML block scalars", () => {
  test("renders run: | with properly indented lines", () => {
    const wf = workflow({
      name: "Multiline Run Test",
      on: { push: {} },
      jobs: {
        job: {
          name: "job",
          "runs-on": "ubuntu-latest",
          steps: [
            {
              name: "configure git",
              run: `git config --global user.email "me@email.com"
            git config --global user.name "bot name"`,
            },
          ],
        },
      },
    });

    const yaml = createSerializer(wf, Bun.YAML.stringify).stringifyWorkflow();

    // Must use block scalar
    expect(yaml).toContain("run: |\n");
    // Lines should be present and indented (2 spaces under run key)
    expect(yaml).toMatch(
      /run: \|\n\s{2}git config --global user.email \"me@email.com\"\n\s{2}git config --global user.name \"bot name\"/
    );
  });
});
