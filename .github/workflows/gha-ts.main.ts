#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { publishJsr } from "../src/utils/jobs";
import { checkoutAndInstallMise } from "../src/utils/steps";
import { generateWorkflow } from "@jlarky/gha-ts/cli";

const ghaTsWorkflow = workflow({
  name: "Test gha-ts",
  on: {
    push: {},
  },
  jobs: {
    formatTest: {
      name: "Format Test",
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallMise(),
        {
          name: "Bun install",
          run: "bun install",
        },
        {
          name: "Format Check",
          run: "mise run format:check",
        },
      ],
    },
    miseTest: {
      name: "Mise Test",
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallMise(),
        {
          name: "Bun install",
          run: "bun install",
        },
        {
          name: "Test gha-ts",
          run: "mise run test",
        },
      ],
    },
    dryRunPublish: publishJsr({ dryRun: true }),
    tryPublishedPackage: {
      name: "Try Published Package",
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallMise(),
        {
          name: "Run the test",
          run: "mise run validate-published-package",
        },
      ],
    },
  },
});

await generateWorkflow(ghaTsWorkflow, YAML.stringify, import.meta.url);
