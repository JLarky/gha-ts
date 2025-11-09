#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { generateWorkflow } from "@jlarky/gha-ts/cli";
import { ctx, expr, fn } from "../../src/context";

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
          name: "Push ref (ctx.pushEvent.ref)",
          if: expr`${fn.contains(ctx.github.event_name, "push")}`,
          run: `echo ${expr`${ctx.pushEvent.ref}`}`,
        },
        {
          name: "Push head commit sha",
          if: expr`${fn.contains(ctx.github.event_name, "push")}`,
          run: `echo ${expr`${ctx.pushEvent.head_commit.id}`}`,
        },
        {
          name: "Push pusher email (safe example)",
          if: expr`${fn.contains(ctx.github.event_name, "push")}`,
          run: `echo ${expr`${ctx.pushEvent.pusher.email}`}`,
        },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
