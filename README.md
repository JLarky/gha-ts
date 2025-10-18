[![GitHub Release](https://img.shields.io/github/v/release/JLarky/gha-ts?include_prereleases)](https://github.com/JLarky/gha-ts/releases/latest)
[![GitHub License](https://img.shields.io/github/license/JLarky/gha-ts)](https://github.com/JLarky/gha-ts/blob/main/LICENSE)

# <img src="icon.png" alt="gha-ts" width="55"/> gha-ts

A TypeScript library for writing GitHub Actions workflows and rendering them to YAML.

- Parity-first with `stefma/pkl-gha` semantics
- Stable YAML rendering (Bun’s `Bun.YAML` or npm `yaml`)

## What?

Author GitHub Actions workflows in TypeScript with strong typing and helpful validation, then render to YAML for `.github/workflows/`.

- **Strong typing**: Catch errors at build-time instead of in CI.
- **Parity with Pkl**: Mirrors Pkl fields and behavior so upstream patches transfer with minimal churn.
- **Deterministic YAML**: Stable key ordering and converters.

## Install

Choose a registry and installer:

- From npm (using nypm):

```bash
# Core package
nypm add -D @jlarky/gha-ts

# Node.js only: add YAML stringifier (Bun users can skip this)
nypm add -D yaml
```

- From JSR (using the jsr CLI):

```bash
# If you have the jsr CLI installed
jsr add @jlarky/gha-ts

# Without a global install
npx jsr add @jlarky/gha-ts
# or
bunx jsr add @jlarky/gha-ts
```

Notes:
- Bun users can use the built-in `Bun.YAML.stringify` and do not need the `yaml` package.
- Node.js users should install `yaml` and pass `YAML.stringify` to the renderer.

## Quickstart

Create a workflow module at `.github/src/ci.ts`:

```ts
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "@jlarky/gha-ts/actions";

export default workflow({
  name: "CI",
  on: {
    push: { branches: ["main"] },
    pull_request: {},
  },
  jobs: {
    test: {
      "runs-on": "ubuntu-latest",
      steps: [
        checkout({ fetchDepth: 0 }),
        { name: "Run unit tests", run: "bun test" },
      ],
    },
  },
});
```

### Build script (Bun)

`.github/build.ts`:

```ts
#!/usr/bin/env bun
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { generateWorkflows, scanWorkflows } from "@jlarky/gha-ts/cli";
import { createSerializer } from "@jlarky/gha-ts/render";

async function main() {
  const _dirname = dirname(fileURLToPath(import.meta.url));
  const workflowsDir = resolve(_dirname, ".github/workflows");
  const srcDir = resolve(_dirname, ".github/src");

  await generateWorkflows({
    srcModules: await scanWorkflows({ srcDir, outDir: workflowsDir }),
    onModule: async (module) => {
      createSerializer(module.workflow, Bun.YAML.stringify).writeWorkflow(
        module.outFile,
      );
    },
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Run:

```bash
bun run -watch .github/build.ts
```

### Build script (Node.js)

`.github/build.ts`:

```ts
#!/usr/bin/env node
import YAML from "yaml";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { generateWorkflows, scanWorkflows } from "@jlarky/gha-ts/cli";
import { createSerializer } from "@jlarky/gha-ts/render";

async function main() {
  const _dirname = dirname(fileURLToPath(import.meta.url));
  const workflowsDir = resolve(_dirname, ".github/workflows");
  const srcDir = resolve(_dirname, ".github/src");

  await generateWorkflows({
    srcModules: await scanWorkflows({ srcDir, outDir: workflowsDir }),
    onModule: async (module) => {
      createSerializer(module.workflow, YAML.stringify).writeWorkflow(
        module.outFile,
      );
    },
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Run:

```bash
chmod +x .github/build.ts
.github/build.ts
```

### Using mise (recommended)

This repo includes a `mise` task that watches sources and writes to `.github/workflows/*.generated.yml`:

```bash
mise run workflows:build
```

## Examples

- Real workflows for this repo live in `.github/src` and render to `.github/workflows`.
- Additional usage examples: `src/examples/`.

## Design constraints

- Parity-first: mirror Pkl field names, option mappings, and behavior.
- YAML rendering uses Bun’s built-in YAML or npm `yaml` with stable ordering. See the [Bun YAML API](https://bun.com/docs/api/yaml).
- Aggregated `Action` helpers under `@jlarky/gha-ts/actions`.

## Status

Core parity is implemented for `Workflow`, `Context` helpers, `Action` helpers, and renderer. More examples and golden tests can be added over time.

## License

MIT
