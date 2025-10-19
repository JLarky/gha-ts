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
- Bun users will import YAML from bun and node user will use `yaml` from npm.

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

Or if you are using Node.js, create a workflow module at `.github/workflows/example-node.main.ts`:

```ts
#!/usr/bin/env node
import YAML from "yaml";
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

### Build script (Bun)

```bash
chmod +x .github/workflows/example-bun.main.ts
.github/workflows/example-bun.main.ts
```

Or in watch mode:

```bash
bun run --watch .github/workflows/example-bun.main.ts
```

### Build script (Node.js)

```bash
chmod +x .github/workflows/example-node.main.ts
.github/workflows/example-node.main.ts
```

If you want to rebuild multiple workflows at once you can write a simple script to do so. For example look at the [.github/build.ts](https://github.com/JLarky/gha-ts/blob/main/.github/build.ts) script we use in this repo.

## Examples

- Look at the [.github/workflows](https://github.com/JLarky/gha-ts/tree/main/.github/workflows) directory for workflow examples.
- Additional usage examples: `src/examples/`.

## License

MIT

## Alternatives

- [ghats](https://github.com/koki-develop/ghats)
- [github-actions-workflow-ts](https://github.com/emmanuelnk/github-actions-workflow-ts)
- [github-actions-wac](https://github.com/webiny/github-actions-wac)
- [github-actions-typing](https://github.com/typesafegithub/github-actions-typing)
- [actions-toolkit](https://github.com/actions/toolkit)

Non JavaScript/TypeScript:

- [pkl-gha](https://github.com/stefma/pkl-gha)
- [kotlin-github-actions-dsl](https://github.com/nefilim/kotlin-github-actions-dsl)
- [github-workflows-kt](https://github.com/typesafegithub/github-workflows-kt)
