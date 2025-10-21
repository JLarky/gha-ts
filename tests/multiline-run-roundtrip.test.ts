import { describe, expect, test } from "bun:test";
import YAML from "yaml";

import { createSerializer } from "@jlarky/gha-ts/render";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { toYamlReadyObject } from "../src/render/yaml";

describe("roundtrip: multiline run retains exact semantics", () => {
  test("Bun.YAML.stringify -> YAML.parse equals canonical object", () => {
    const wf = workflow({
      name: "Multiline Roundtrip",
      on: { push: {} },
      jobs: {
        job: {
          name: "job",
          "runs-on": "ubuntu-latest",
          steps: [
            {
              name: "script",
              run: [
                'git config --global user.email "me@email.com"',
                'git config --global user.name "bot name"',
              ].join("\n"),
            },
          ],
        },
      },
    });

    const canonical = toYamlReadyObject(wf);
    const yaml = createSerializer(wf, Bun.YAML.stringify).stringifyWorkflow();
    const parsed = YAML.parse(yaml);

    expect(parsed).toEqual(canonical);
  });
});
