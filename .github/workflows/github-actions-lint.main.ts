#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "@jlarky/gha-ts/actions";
import { generateWorkflow } from "@jlarky/gha-ts/cli";

const wf = workflow({
  name: "GitHub Actions Lint",
  on: {
    pull_request: { paths: [".github/**"] },
    push: { branches: ["main"], paths: [".github/**"] },
  },
  concurrency: {
    group: "${{ github.workflow }}-${{ github.ref }}",
    "cancel-in-progress": true,
  },
  jobs: {
    actionlint: {
      "runs-on": "ubuntu-latest",
      permissions: { contents: "read" },
      "timeout-minutes": 5,
      steps: [
        checkout(),
        {
          uses: "koki-develop/github-actions-lint/actionlint@62dfef5c9854a07712bad7af3bee7edb0c1109b1",
        },
      ],
    },
    ghalint: {
      "runs-on": "ubuntu-latest",
      permissions: { contents: "read" },
      "timeout-minutes": 5,
      steps: [
        checkout(),
        {
          uses: "koki-develop/github-actions-lint/ghalint@62dfef5c9854a07712bad7af3bee7edb0c1109b1",
        },
      ],
    },
    zizmor: {
      "runs-on": "ubuntu-latest",
      permissions: { contents: "read" },
      "timeout-minutes": 5,
      steps: [
        checkout(),
        {
          with: { "github-token": "${{ github.token }}", persona: "auditor" },
          uses: "koki-develop/github-actions-lint/zizmor@62dfef5c9854a07712bad7af3bee7edb0c1109b1",
        },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
