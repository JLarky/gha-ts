#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { generateWorkflow } from "@jlarky/gha-ts/cli";

export const wf = workflow({
  name: "GitHub Action Triggers",
  on: {
    branch_protection_rule: {},
    check_run: {},
    check_suite: {},
    create: {},
    delete: {},
    deployment: {},
    deployment_status: {},
    discussion: {},
    discussion_comment: {},
    fork: {},
    gollum: {},
    issue_comment: {},
    issues: {},
    label: {},
    milestone: {},
    page_build: {},
    project: {},
    project_card: {},
    project_column: {},
    public: {},
    pull_request: {},
    pull_request_review: {},
    pull_request_review_comment: {},
    pull_request_target: {},
    push: {},
    registry_package: {},
    release: {},
    repository_dispatch: {},
    schedule: [
      { cron: "*/10 * * * *" },
      { cron: "5 4 * * *" },
      { cron: "* 0 * * 0" },
    ],
    status: {},
    watch: {},
    workflow_call: {},
    workflow_dispatch: {},
    workflow_run: { workflows: ["some_other"] },
  },
  jobs: {
    doesntMatter: {
      "runs-on": "ubuntu-latest",
      steps: [{ run: "echo 'Hello, World!'", name: "Hello" }],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
