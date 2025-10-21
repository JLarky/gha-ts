#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "../../src/workflow-types";
import { checkout, setupBun } from "../../src/actions";
import { generateWorkflow } from "../../src/cli";

const wf = workflow({
  name: "Example workflow",
  on: {
    push: { branches: ["main"] },
    pull_request: {},
  },
  jobs: {
    exampleJobBun: {
      "runs-on": "ubuntu-latest",
      steps: [
        checkout({ fetchDepth: 0 }),
        setupBun({ bunVersion: "1.3.0" }),
        { name: "Test", run: "bun --version" },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
