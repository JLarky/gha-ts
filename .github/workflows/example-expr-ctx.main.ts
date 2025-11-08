#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "@jlarky/gha-ts/actions";
import { generateWorkflow } from "@jlarky/gha-ts/cli";
import { ctx, expr } from "../../src/context";
import { fn } from "../../src/context-generated";

const wf = workflow({
  name: "Example: expr/ctx demo",
  on: {
    push: { branches: ["main"] },
    pull_request: {},
  },
  jobs: {
    demo: {
      "runs-on": "ubuntu-latest",
      steps: [
        checkout(),
        {
          name: "Echo current ref using ctx",
          run: `echo ${expr`${ctx.github.ref}`}`,
        },
        {
          name: "Echo formatted message (format)",
          run: `echo ${expr`${fn.format("Run {0} on {1}", ctx.github.run_id, ctx.runner.os)}`}`,
        },
        {
          name: "Echo env var (mapped)",
          env: {
            NODE_VERSION: "18.17.1",
          },
          run: `echo ${expr`${ctx.env.any("NODE_VERSION")}`}`,
        },
        {
          name: "Echo repo owner (github prop)",
          run: `echo ${expr`${ctx.github.repository_owner}`}`,
        },
        {
          name: "Echo PR number (github.event.*)",
          if: expr`${fn.contains(ctx.github.event_name, "pull_request")}`,
          run: `echo ${expr`${ctx.github.event("pull_request.number")}`}`,
        },
        {
          name: "Echo when on main using fn/expr",
          if: expr`${fn.startsWith(ctx.github.ref, "refs/heads/main")}`,
          run: "echo 'This runs only on main'",
        },
        {
          name: "Echo contains check via fn.contains",
          if: expr`${fn.contains(ctx.github.ref_name, "main")}`,
          run: "echo 'ref_name contains main'",
        },
        {
          name: "Join example",
          run: `echo ${expr`${fn.join(fn.fromJSON('["a","b","c"]'), ",")}`}`,
        },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
