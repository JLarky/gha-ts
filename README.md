[![GitHub Release](https://img.shields.io/github/v/release/JLarky/gha-ts?include_prereleases)](https://github.com/JLarky/gha-ts/releases/latest)
[![GitHub License](https://img.shields.io/github/license/JLarky/gha-ts)](https://github.com/JLarky/gha-ts/blob/main/LICENSE)

# <img src="https://raw.githubusercontent.com/JLarky/gha-ts/HEAD/icon.png" alt="gha-ts" width="55"/> gha-ts

A TypeScript library for writing GitHub Actions workflows and rendering them to YAML.

- Extremely lean core, gha-ts has 0 dependencies, you provide your own yaml serializer (or just use JSON.stringify, because any valid JSON is also valid YAML)
- No typescript overhead. Github will only use generated YAML files, so it won't see the difference. You use typescript just on your machine and heck, it doesn't even has to be typescript (see javascript example in Examples section)!
- For quicker onboarding [we provide CLI](https://github.com/JLarky/gha-ts-enterprise-node/blob/main/.github/workflows/utils/convert-cli.ts) to convert all of your existing workflows to TypeScript (or start with one file!).

It's easy to start with gha-ts, but for production-ready uses I would strongly recommend checking out [gha-ts-enterprise-node](https://github.com/JLarky/gha-ts-enterprise-node) example, that includes things like build/watch scripts, action version locking, linting of your workflows and an example of a [CI job](https://github.com/JLarky/gha-ts-enterprise-node/blob/main/.github/workflows/check-gha-ts-workflows-converted.main.ts) that checks that generated YAML files are in sync with the source.

## Install

If using Bun:

```bash
bunx jsr add -D @jlarky/gha-ts # or bun add -D @jlarky/gha-ts
```

If using Node.js:

```bash
npx nypm add -D @jlarky/gha-ts yaml # or npx jsr add -D @jlarky/gha-ts
```

Notes:
- Bun users will import YAML from bun and node users will use `yaml` from npm.
- This example is using Bun, but you can find other examples in the [examples](examples) directory.

## Quickstart

Create a workflow module at `.github/workflows/example-bun.main.ts` (when using Bun):

```ts
#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "@jlarky/gha-ts/actions";
import { generateWorkflow } from "@jlarky/gha-ts/cli";

const wf = workflow({
  name: "Example workflow",
  on: {
    push: { branches: ["main"] },
    pull_request: {},
  },
  jobs: {
    exampleJob: {
      "runs-on": "ubuntu-latest",
      steps: [
        checkout({ "fetch-depth": 0 }),
        { name: "Test", run: "echo 'Hello, world!'" },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
```

## Context Helpers

`@jlarky/gha-ts/context` ships a production-ready DSL for authoring GitHub Actions expressions without hand-writing `${{ ... }}`:

```ts
import { expr, ctx, fn } from "@jlarky/gha-ts/context";

const wf = workflow({
  "run-name": expr`${ctx.github.event_name} - ${fn.coalesce(
    ctx.github.head_ref,
    ctx.github.ref,
  )}`,
  on: { merge_group: {} },
  concurrency: {
    group: expr`${ctx.github.workflow} - ${ctx.github.ref}`,
    "cancel-in-progress": true,
  },
  jobs: {
    checks: {
      if: expr`${fn.or(
        fn.eq(ctx.github.event_name, "merge_group"),
        fn.endsWith(ctx.github.head_ref, "-run-tests"),
      )}`,
      steps: [
        { uses: "actions/checkout@v4" },
        {
          name: "Publish artifact",
          env: {
            ARTIFACT_PATH: expr`${ctx.steps.output("build", "path")}`,
          },
          run: "bun run publish",
        },
      ],
    },
  },
});
```

Highlights:

- `expr\`\`` guarantees a single wrapper and auto-quotes plain strings.
- `ctx` exposes strongly-typed fragments for all GitHub contexts (`ctx.github.ref`, `ctx.needs.output("lint", "result")`, ...).
- `fn` mirrors GitHub's expression functions with auto-quoting baked in (`fn.contains`, `fn.coalesce`, `fn.hashFiles`, ...).
- Helpers like `ctx.raw(value)` and `ctx.token("github.ref")` stay available for edge cases.

See `tests/context-helpers.test.ts` for additional examples.

## Examples

- Look at the [.github/workflows](https://github.com/JLarky/gha-ts/tree/main/.github/workflows) directory for workflow examples.
- Additional usage examples: `examples/`.
- [Hello world (Bun)](https://github.com/JLarky/gha-ts/tree/main/examples/hello-world-bun/)
- [Hello world (Node.js)](https://github.com/JLarky/gha-ts/tree/main/examples/hello-world-node/)
- [Hello world (Javascript)](https://github.com/JLarky/gha-ts/tree/main/examples/hello-world-node-20/)
- [Hello world (Deno)](https://github.com/JLarky/gha-ts/tree/main/examples/hello-world-deno/)
- [Enterprise (Node.js)](https://github.com/JLarky/gha-ts-enterprise-node) - great example of using gha-ts "for real".

## License

MIT

## Alternatives

- [actions-toolkit](https://github.com/actions/toolkit)
- [ghats](https://github.com/koki-develop/ghats)
- [github-actions-typescript](https://github.com/thedjpetersen/github-actions-typescript)
- [github-actions-typing](https://github.com/typesafegithub/github-actions-typing)
- [github-actions-wac](https://github.com/webiny/github-actions-wac)
- [github-actions-workflow-ts](https://github.com/emmanuelnk/github-actions-workflow-ts)
- [workflow-ts](https://github.com/galabra/workflow-ts)

Non JavaScript/TypeScript:

- [dagger](https://docs.dagger.io/getting-started/quickstarts/ci/)
- [github-workflows-kt](https://github.com/typesafegithub/github-workflows-kt)
- [kotlin-github-actions-dsl](https://github.com/nefilim/kotlin-github-actions-dsl)
- [pkl-gha](https://github.com/stefma/pkl-gha)
