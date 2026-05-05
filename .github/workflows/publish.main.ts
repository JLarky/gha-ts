#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { publishJsr } from "./utils/jobs";
import { generateWorkflow } from "@jlarky/gha-ts/cli";

const wf = workflow({
  name: "Publish",
  on: {
    release: { types: ["published"] },
    workflow_dispatch: {},
  },
  permissions: {
    contents: "read",
    "id-token": "write",
  },
  jobs: {
    publish: publishJsr({ dryRun: false }),
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
