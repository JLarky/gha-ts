#!/usr/bin/env -S deno --allow-write=.
import YAML from "npm:yaml";
import { workflow } from "jsr:@jlarky/gha-ts/workflow-types";
import { checkout } from "jsr:@jlarky/gha-ts/actions";
import { generateWorkflow } from "jsr:@jlarky/gha-ts/cli";

const wf = workflow({
  name: "Example workflow",
  on: {
    push: { branches: ["main"] },
    pull_request: {},
  },
  jobs: {
    exampleJob: {
      "runs-on": "ubuntu-latest",
      steps: [
        checkout({ fetchDepth: 0 }),
        { name: "Test", run: "echo 'Hello, world!'" },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
