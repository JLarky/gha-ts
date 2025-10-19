#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkoutAndInstallPkl } from "../src/utils/steps";
import { generateWorkflow } from "@jlarky/gha-ts/cli";

const testWorkflow = workflow({
  name: "Test",
  on: {
    push: {
      branches: ["main"],
    },
    pull_request: {},
  },
  jobs: {
    test: {
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallPkl(),
        {
          name: "Test pkl module",
          "working-directory": ".pkl",
          run: "pkl test",
        },
      ],
    },
  },
});

await generateWorkflow(testWorkflow, YAML.stringify, import.meta.url);
