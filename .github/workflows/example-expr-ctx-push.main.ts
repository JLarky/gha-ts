#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { generateWorkflow } from "@jlarky/gha-ts/cli";
import { ctx, expr, push, fn } from "../../src/context";

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
          name: "Push scoped ref (ctx.github.event + push.expr)",
          if: expr`${fn.contains(ctx.github.event_name, "push")}`,
          run: `echo ${push.expr`${ctx.github.event.ref}`}`,
        },
        {
          name: "Push head commit sha",
          if: expr`${fn.contains(ctx.github.event_name, "push")}`,
          run: `echo ${push.expr`${ctx.github.event.head_commit.id}`}`,
        },
        {
          name: "Push pusher email (safe example)",
          if: expr`${fn.contains(ctx.github.event_name, "push")}`,
          run: `echo ${push.expr`${ctx.github.event.pusher.email}`}`,
        },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
