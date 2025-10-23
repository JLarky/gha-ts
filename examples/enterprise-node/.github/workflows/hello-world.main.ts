#!/usr/bin/env -S node --no-warnings
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "@jlarky/gha-ts/actions";
import { generateWorkflowYaml } from "./utils/yaml.ts";

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
        checkout({ "fetch-depth": 0 }),
        { name: "Test", run: "echo 'Hello, world!'" },
      ],
    },
  },
});

await generateWorkflowYaml(wf, import.meta.url);
