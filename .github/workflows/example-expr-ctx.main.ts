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
          name: "Echo when on main using fn/expr",
          if: expr`${fn.startsWith(ctx.github.ref, 'refs/heads/main')}`,
          run: "echo 'This runs only on main'",
        },
        {
          name: "Echo contains check via fn.contains",
          if: expr`${fn.contains(ctx.github.ref_name, 'main')}`,
          run: "echo 'ref_name contains main'",
        },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);


