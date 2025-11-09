#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "@jlarky/gha-ts/actions";
import { generateWorkflow } from "@jlarky/gha-ts/cli";
import { ctx, expr, fn } from "../../src/context";

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
          run: `echo ${expr`${ctx.env.NODE_VERSION}`}`,
        },
        {
          name: "Use secret in env",
          env: {
            GITHUB_TOKEN: expr`${ctx.secrets.GITHUB_TOKEN}`,
          },
          run: "echo 'token is set'",
        },
        {
          name: "Echo org variable via ctx.vars",
          env: {
            ORG_VAR: expr`${ctx.vars.MY_ORG_VAR}`,
          },
          run: `echo "$ORG_VAR"`,
        },
        {
          name: "Echo repo owner (github prop)",
          run: `echo ${expr`${ctx.github.repository_owner}`}`,
        },
        {
          name: "Echo PR number (ctx.prEvent.number)",
          if: expr`${fn.contains(ctx.github.event_name, "pull_request")}`,
          run: `echo ${expr`${ctx.prEvent.number}`}`,
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
        {
          name: "PR number via ctx.prEvent",
          if: expr`${fn.contains(ctx.github.event_name, "pull_request")}`,
          run: `echo ${expr`${ctx.prEvent.number}`}`,
        },
        {
          name: "PR head/base refs",
          if: expr`${fn.contains(ctx.github.event_name, "pull_request")}`,
          env: {
            HEAD_REF: expr`${ctx.prEvent.head.ref}`,
            BASE_REF: expr`${ctx.prEvent.base.ref}`,
          },
          run: `echo "$HEAD_REF"; echo "$BASE_REF"`,
        },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
