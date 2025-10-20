[![GitHub Release](https://img.shields.io/github/v/release/JLarky/gha-ts?include_prereleases)](https://github.com/JLarky/gha-ts/releases/latest)
[![GitHub License](https://img.shields.io/github/license/JLarky/gha-ts)](https://github.com/JLarky/gha-ts/blob/main/LICENSE)

# <img src="https://raw.githubusercontent.com/JLarky/gha-ts/HEAD/icon.png" alt="gha-ts" width="55"/> gha-ts

A TypeScript library for writing GitHub Actions workflows and rendering them to YAML.

- Parity-first with `stefma/pkl-gha` semantics
- Stable YAML rendering (Bun’s `Bun.YAML` or npm `yaml`)

## What?

Author GitHub Actions workflows in TypeScript with strong typing and helpful validation, then render to YAML for `.github/workflows/`.

- **Strong typing**: Catch errors at build-time instead of in CI.
- **Deterministic YAML**: Stable key ordering and converters.

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
        checkout({ fetchDepth: 0 }),
        { name: "Test", run: "echo 'Hello, world!'" },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
```

## Examples

- Look at the [.github/workflows](https://github.com/JLarky/gha-ts/tree/main/.github/workflows) directory for workflow examples.
- Additional usage examples: `src/examples/`.
- [Hello world (Bun)](https://github.com/JLarky/gha-ts/tree/main/examples/hello-world-bun/)
- [Hello world (Node.js)](https://github.com/JLarky/gha-ts/tree/main/examples/hello-world-node/)

## License

MIT

## Alternatives

- [actions-toolkit](https://github.com/actions/toolkit)
- [ghats](https://github.com/koki-develop/ghats)
- [github-actions-typescript](https://github.com/thedjpetersen/github-actions-typescript)
- [github-actions-typing](https://github.com/typesafegithub/github-actions-typing)
- [github-actions-wac](https://github.com/webiny/github-actions-wac)
- [github-actions-workflow-ts](https://github.com/emmanuelnk/github-actions-workflow-ts)

Non JavaScript/TypeScript:

- [github-workflows-kt](https://github.com/typesafegithub/github-workflows-kt)
- [kotlin-github-actions-dsl](https://github.com/nefilim/kotlin-github-actions-dsl)
- [pkl-gha](https://github.com/stefma/pkl-gha)
