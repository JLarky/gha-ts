#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { generateWorkflow } from "@jlarky/gha-ts/cli";
import { ctx, expr, push } from "../../src/context";
import { fn } from "@jlarky/gha-ts/context-generated";

const wf = workflow({
  name: "Example: push events demo",
  on: {
    push: { branches: ["main"] },
  },
  jobs: {
    demo: {
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "Push scoped ref (ctx.push + push.expr)",
          if: expr`${fn.contains(ctx.github.event_name, "push")}`,
          run: `echo ${push.expr`${ctx.push.ref}`}`,
        },
        {
          name: "Push head commit sha",
          if: expr`${fn.contains(ctx.github.event_name, "push")}`,
          run: `echo ${push.expr`${ctx.push.head_commit.id}`}`,
        },
        {
          name: "Push pusher email (safe example)",
          if: expr`${fn.contains(ctx.github.event_name, "push")}`,
          run: `echo ${push.expr`${ctx.push.pusher.email}`}`,
        },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
