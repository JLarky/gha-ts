#!/usr/bin/env node
// @ts-check
import YAML from "yaml";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "@jlarky/gha-ts/actions";
import { generateWorkflow } from "@jlarky/gha-ts/cli";

const wf = workflow({
  name: "Example workflow",
  on: {
    push: { branches: ["main"] },
    pull_request: {},
  },
  jobs: {
    selfCheck: {
      "runs-on": "ubuntu-latest",
      steps: [
        checkout({}),
        {
          name: "Install dependencies",
          "working-directory": ".github/workflows",
          run: "npm install @jlarky/gha-ts typescript yaml",
        },
        {
          name: "Remove generated workflow",
          run: "rm .github/workflows/example-javascript.generated.yml",
        },
        {
          name: "Build workflows",
          run: "node .github/workflows/example-javascript.main.mjs",
        },
        {
          name: "Verify generated workflow",
          run: "git diff --exit-code .github/workflows/example-javascript.generated.yml",
        },
        {
          name: "Type-Check",
          run: "tsc --noEmit --skipLibCheck --allowJs --module nodenext --moduleResolution nodenext .github/workflows/example-javascript.main.mjs",
        },
      ],
    },
    exampleJob: {
      "runs-on": "ubuntu-latest",
      steps: [
        checkout({ "fetch-depth": 0 }),
        { name: "Test", run: "echo 'Hello, world!'" },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
